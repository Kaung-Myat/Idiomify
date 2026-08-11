const DEFAULT_SPEECH_LANG = "en-US";

export type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

export function speakText(text: string, options?: SpeakOptions): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options?.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = DEFAULT_SPEECH_LANG;
  utterance.rate = 0.95;

  // Prefer an en-US voice if the browser provides one.
  // This improves consistency for US-English slang/intonation demos.
  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices?.() ?? [];
    const match =
      voices.find((v) => v.lang === DEFAULT_SPEECH_LANG) ??
      voices.find((v) => v.lang?.startsWith("en-"));
    if (match) utterance.voice = match;
  };

  pickVoice();

  // Some browsers load voices async; try again on voiceschanged.
  window.speechSynthesis.onvoiceschanged = () => pickVoice();

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
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
