"use client";

export type SpeakResult = {
  ok: boolean;
  message?: string;
};

export function speakEnglish(text: string, rate = 0.9): SpeakResult {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { ok: false, message: "Озвучка недоступна в этом браузере." };
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (englishVoice) utterance.voice = englishVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return {
    ok: true,
    message: englishVoice ? undefined : "Английский голос не найден, используется голос браузера."
  };
}
