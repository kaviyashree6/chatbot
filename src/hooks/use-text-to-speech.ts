import { useState, useCallback, useRef, useEffect } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
];

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  label: string;
  isNatural: boolean;
}

interface UseTTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export function useTextToSpeech(options: UseTTSOptions = {}) {
  const { rate = 0.9, pitch = 1, volume = 1, lang = 'en-US' } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentLang, setCurrentLang] = useState(lang);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Update current lang when option changes
  useEffect(() => {
    setCurrentLang(lang);
    setSelectedVoiceIndex(null); // Reset voice selection when language changes
  }, [lang]);

  // Get available voices for current language with accent info
  const getVoicesForLanguage = useCallback((): VoiceOption[] => {
    const langPrefix = currentLang.split('-')[0];
    const langVoices = voices.filter(v => 
      v.lang.startsWith(langPrefix) || v.lang.toLowerCase().startsWith(langPrefix)
    );
    
    return langVoices.map((voice, index) => {
      const isNatural = voice.name.includes('Natural') || 
                        voice.name.includes('Enhanced') || 
                        voice.name.includes('Neural') ||
                        voice.name.includes('Google');
      
      // Create a readable label with accent info
      let label = voice.name;
      if (voice.lang !== currentLang) {
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === voice.lang);
        if (langInfo) {
          label = `${voice.name} (${langInfo.name})`;
        }
      }
      
      return {
        voice,
        label,
        isNatural,
      };
    });
  }, [voices, currentLang]);

  const speak = useCallback((text: string, voiceIndex?: number) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = currentLang;

    // Get available voices for the language
    const langVoices = getVoicesForLanguage();
    
    // Use selected voice or find best default
    const indexToUse = voiceIndex ?? selectedVoiceIndex;
    if (indexToUse !== null && langVoices[indexToUse]) {
      utterance.voice = langVoices[indexToUse].voice;
    } else if (langVoices.length > 0) {
      // Prefer natural/enhanced voices
      const naturalVoice = langVoices.find(v => v.isNatural);
      utterance.voice = naturalVoice?.voice || langVoices[0].voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, currentLang, getVoicesForLanguage, selectedVoiceIndex]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  const changeLang = useCallback((newLang: string) => {
    setCurrentLang(newLang);
    setSelectedVoiceIndex(null);
  }, []);

  const selectVoice = useCallback((index: number | null) => {
    setSelectedVoiceIndex(index);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
    currentLang,
    changeLang,
    selectedVoiceIndex,
    selectVoice,
    getVoicesForLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
