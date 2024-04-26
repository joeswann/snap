import { useEffect, useState } from "react";

export const useSpeech = () => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [wakeWord, setWakeWord] = useState("computer");

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      setRecognition(new webkitSpeechRecognition());
      setIsSpeechSupported(true);
    }
  }, []);

  const startListening = (onResult: (transcript: string) => void) => {
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.start();

      let isWakeWordDetected = false;

      recognition.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript.trim();

        if (
          !isWakeWordDetected &&
          transcript.toLowerCase().includes(wakeWord)
        ) {
          isWakeWordDetected = true;
          recognition.stop();
          startMainRecognition(onResult);
        }
      };
    }
  };

  const startMainRecognition = (onResult: (transcript: string) => void) => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        recognition.stop();
        startListening(onResult);
      };
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const speakMessage = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return {
    startListening,
    stopListening,
    speakMessage,
    isSpeechSupported,
    wakeWord,
    setWakeWord,
  };
};
