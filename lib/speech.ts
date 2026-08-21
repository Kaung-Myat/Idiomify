const DEFAULT_SPEECH_LANG = "en-US";

export type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

let speakToken = 0;

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  return (
    voices.find((v) => v.lang === DEFAULT_SPEECH_LANG) ??
    voices.find((v) => v.lang?.startsWith("en-")) ??
    null
  );
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices?.() ?? [];
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", onChange);
      resolve(synth.getVoices?.() ?? []);
    };
    const onChange = () => finish();
    synth.addEventListener("voiceschanged", onChange);
    // Some browsers never fire voiceschanged — don't hang forever.
    window.setTimeout(finish, 400);
  });
}

/**
 * Speak `text` with Web Speech API.
 * Handles Chrome quirks: cancel→speak races and "paused" silent failures.
 */
export function speakText(text: string, options?: SpeakOptions): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options?.onEnd?.();
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    options?.onEnd?.();
    return;
  }

  const token = ++speakToken;
  const synth = window.speechSynthesis;

  // Cancel any in-flight utterance, then resume if Chrome left synth paused.
  synth.cancel();
  if (synth.paused) synth.resume();

  void waitForVoices().then(() => {
    if (token !== speakToken) return;

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = DEFAULT_SPEECH_LANG;
    utterance.rate = 0.95;
    const voice = pickEnglishVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (token === speakToken) options?.onStart?.();
    };
    utterance.onend = () => {
      if (token === speakToken) options?.onEnd?.();
    };
    utterance.onerror = () => {
      if (token === speakToken) options?.onEnd?.();
    };

    // Chrome often drops speak() right after cancel(); a tick fixes it.
    window.setTimeout(() => {
      if (token !== speakToken) return;
      if (synth.paused) synth.resume();
      synth.speak(utterance);
      // Another Chrome bug: queue stays paused with no sound until resume().
      if (synth.paused) synth.resume();
    }, 40);
  });
}

export function stopSpeaking(): void {
  speakToken += 1;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export function getSpeechRecognition():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported(): boolean {
  return getSpeechRecognition() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && Boolean(window.speechSynthesis);
}
