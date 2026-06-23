import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';

interface Props {
  onAdd: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
}

export const VoiceActivityButton = ({ onAdd }: Props) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
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
    } catch (e) {
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
      if (data?.transcript) toast.message(`🎤 "${data.transcript}"`);
      if (!data?.ok || !data?.activity) {
        toast.error(data?.error || 'Nepodařilo se rozpoznat aktivitu');
        return;
      }
      const activity = {
        ...data.activity,
        date: data.activity.date || new Date().toISOString().split('T')[0],
      };
      onAdd(activity);
      toast.success(`Přidáno: ${activity.type}`);
    } catch (e: any) {
      toast.error(e.message || 'Chyba při zpracování');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Zpracovávám...
      </Button>
    );
  }

  return (
    <Button
      variant={recording ? 'destructive' : 'outline'}
      size="sm"
      onClick={recording ? stop : start}
    >
      {recording ? <Square className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
      {recording ? 'Stop' : 'Hlas'}
    </Button>
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
