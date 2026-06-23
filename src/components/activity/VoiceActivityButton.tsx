import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onAdd: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
}

type Draft = Omit<Activity, 'id' | 'createdAt'> & Record<string, any>;

const TYPE_LABELS: Record<string, string> = {
  running: 'Běh',
  swimming: 'Plavání',
  walking: 'Chůze',
  cycling: 'Cyklistika',
  squats: 'Dřepy',
  pushup: 'Kliky',
  plank: 'Plank',
  grip: 'Zápěstí',
};

const secondsToMMSS = (s?: number) => {
  if (!s && s !== 0) return '';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const mmssToSeconds = (v: string): number => {
  if (!v) return 0;
  if (v.includes(':')) {
    const [m, s] = v.split(':').map(n => parseInt(n) || 0);
    return m * 60 + s;
  }
  return parseInt(v) || 0;
};

export const VoiceActivityButton = ({ onAdd }: Props) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [transcript, setTranscript] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = handleStop;
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error('Nelze otevřít mikrofon');
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const handleStop = async () => {
    const mime = recorderRef.current?.mimeType || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mime });
    if (blob.size < 1024) {
      toast.error('Nahrávka je příliš krátká');
      return;
    }
    setProcessing(true);
    try {
      const b64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke('voice-activity', {
        body: { audio: b64, mimeType: mime },
      });
      if (error) throw error;
      if (!data?.ok || !data?.activity) {
        if (data?.transcript) toast.message(`🎤 "${data.transcript}"`);
        toast.error(data?.error || 'Nepodařilo se rozpoznat aktivitu');
        return;
      }
      setTranscript(data.transcript || '');
      setDraft({
        ...data.activity,
        date: data.activity.date || new Date().toISOString().split('T')[0],
      });
    } catch (e: any) {
      toast.error(e.message || 'Chyba při zpracování');
    } finally {
      setProcessing(false);
    }
  };

  const confirm = () => {
    if (!draft) return;
    onAdd(draft as Omit<Activity, 'id' | 'createdAt'>);
    toast.success(`Přidáno: ${TYPE_LABELS[draft.type] || draft.type}`);
    setDraft(null);
    setTranscript('');
  };

  const update = (key: string, value: any) => {
    setDraft(d => (d ? { ...d, [key]: value } : d));
  };

  return (
    <>
      {processing ? (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Zpracovávám...
        </Button>
      ) : (
        <Button
          variant={recording ? 'destructive' : 'outline'}
          size="sm"
          onClick={recording ? stop : start}
        >
          {recording ? <Square className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
          {recording ? 'Stop' : 'Hlas'}
        </Button>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="glass-panel border-neon-cyan/30">
          <DialogHeader>
            <DialogTitle className="text-neon-cyan uppercase tracking-widest">
              Potvrzení aktivity
            </DialogTitle>
            {transcript && (
              <DialogDescription className="italic">🎤 "{transcript}"</DialogDescription>
            )}
          </DialogHeader>

          {draft && (
            <div className="space-y-3">
              <div>
                <Label>Typ</Label>
                <div className="text-sm font-bold text-neon-cyan">
                  {TYPE_LABELS[draft.type] || draft.type}
                </div>
              </div>

              <div>
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => update('date', e.target.value)}
                />
              </div>

              {'distance' in draft && (
                <div>
                  <Label htmlFor="distance">
                    Vzdálenost ({draft.type === 'swimming' ? 'm' : 'km'})
                  </Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.01"
                    value={draft.distance ?? ''}
                    onChange={(e) => update('distance', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}

              {('time' in draft || 'duration' in draft) && (
                <div>
                  <Label htmlFor="time">Čas (mm:ss)</Label>
                  <Input
                    id="time"
                    type="text"
                    placeholder="25:00"
                    value={secondsToMMSS('time' in draft ? draft.time : draft.duration)}
                    onChange={(e) => {
                      const s = mmssToSeconds(e.target.value);
                      update('time' in draft ? 'time' : 'duration', s);
                    }}
                  />
                </div>
              )}

              {'reps' in draft && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reps">Opakování</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={draft.reps ?? ''}
                      onChange={(e) => update('reps', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sets">Série</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={draft.sets ?? ''}
                      onChange={(e) => update('sets', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}

              {'steps' in draft && (
                <div>
                  <Label htmlFor="steps">Kroky</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={draft.steps ?? ''}
                    onChange={(e) => update('steps', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {'elevationGain' in draft && (
                <div>
                  <Label htmlFor="elev">Převýšení (m)</Label>
                  <Input
                    id="elev"
                    type="number"
                    value={draft.elevationGain ?? ''}
                    onChange={(e) => update('elevationGain', parseInt(e.target.value) || 0)}
                  />
                </div>
              )}

              {'feeling' in draft && (
                <div>
                  <Label htmlFor="feeling">Pocit (1-5)</Label>
                  <Input
                    id="feeling"
                    type="number"
                    min="1"
                    max="5"
                    value={draft.feeling ?? 3}
                    onChange={(e) => update('feeling', parseInt(e.target.value) || 3)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Zrušit
            </Button>
            <Button onClick={confirm}>Uložit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      const s = r.result as string;
      resolve(s.split(',')[1]);
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
