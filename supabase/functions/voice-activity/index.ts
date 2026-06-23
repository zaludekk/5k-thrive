import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const SYSTEM_PROMPT = `Jsi parser hlasových záznamů fitness aktivit v češtině. Z přepisu rozpoznej aktivitu a vrať pouze JSON (žádný markdown).

Typy: running, swimming, walking, cycling, squats, pushup, plank, grip.
Klíčová slova: běh/běhání=running, plavání=swimming, chůze/procházka=walking, kolo/cyklistika=cycling, dřepy=squats, kliky=pushup, plank/prkno=plank, zápěstí/posilovač/kolečko/stisk=grip.

Schéma podle typu:
- running: { type, distance (km), time (sekundy), feeling (1-5, default 3) }
- swimming: { type, distance (metry), time (sekundy) }
- walking: { type, distance (km), time (sekundy), steps? }
- cycling: { type, distance (km), duration (sekundy), elevationGain? (m) }
- squats: { type, reps?, sets? }
- pushup: { type, reps?, sets? }
- plank: { type, duration (sekundy) }
- grip: { type, reps?, sets? }

Převody: "5 km za 25 minut" => distance:5, time:1500. "půl hodiny" => 1800s. Pokud něco chybí, vynech klíč.
Vrať JSON: { "ok": true, "activity": {...} } nebo { "ok": false, "error": "..." }.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('Missing LOVABLE_API_KEY');

    const { audio, mimeType } = await req.json();
    if (!audio) throw new Error('Missing audio');

    // Decode base64
    const binary = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const ext = mimeType?.includes('mp4') ? 'mp4' : mimeType?.includes('wav') ? 'wav' : 'webm';
    const blob = new Blob([binary], { type: mimeType || 'audio/webm' });

    // 1) Transcribe
    const fd = new FormData();
    fd.append('model', 'openai/gpt-4o-mini-transcribe');
    fd.append('file', blob, `rec.${ext}`);
    fd.append('language', 'cs');

    const sttRes = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: fd,
    });
    if (!sttRes.ok) {
      const t = await sttRes.text();
      return new Response(JSON.stringify({ error: `STT: ${sttRes.status} ${t}` }), { status: sttRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const sttData = await sttRes.json();
    const transcript = sttData.text?.trim() || '';
    if (!transcript) throw new Error('Empty transcript');

    // 2) Parse with LLM
    const chatRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: transcript },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!chatRes.ok) {
      const t = await chatRes.text();
      return new Response(JSON.stringify({ transcript, error: `LLM: ${chatRes.status} ${t}` }), { status: chatRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const chatData = await chatRes.json();
    const content = chatData.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { ok: false, error: 'Parse error', raw: content }; }

    return new Response(JSON.stringify({ transcript, ...parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
