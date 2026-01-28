import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings2, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, VoiceOption } from '@/hooks/use-text-to-speech';
import { Badge } from '@/components/ui/badge';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isTTSEnabled: boolean;
  isSTTSupported: boolean;
  isTTSSupported: boolean;
  speechRate: number;
  currentLanguage: string;
  selectedVoiceIndex: number | null;
  availableVoices: VoiceOption[];
  onStartListening: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onToggleTTS: (enabled: boolean) => void;
  onSpeechRateChange: (rate: number) => void;
  onLanguageChange: (lang: string) => void;
  onVoiceChange: (index: number | null) => void;
  onTestVoice: () => void;
}

export function VoiceControls({
  isListening,
  isSpeaking,
  isTTSEnabled,
  isSTTSupported,
  isTTSSupported,
  speechRate,
  currentLanguage,
  selectedVoiceIndex,
  availableVoices,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onToggleTTS,
  onSpeechRateChange,
  onLanguageChange,
  onVoiceChange,
  onTestVoice,
}: VoiceControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const currentVoice = selectedVoiceIndex !== null ? availableVoices[selectedVoiceIndex] : null;

  return (
    <div className="flex items-center gap-2">
      {/* Microphone button */}
      {isSTTSupported && (
        <Button
          type="button"
          size="icon"
          variant={isListening ? 'destructive' : 'outline'}
          className="h-12 w-12 rounded-xl relative"
          onClick={isListening ? onStopListening : onStartListening}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MicOff className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Listening indicator */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-destructive"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </Button>
      )}

      {/* Live Speaking Toggle Button */}
      {isTTSSupported && (
        <Button
          type="button"
          size="icon"
          variant={isTTSEnabled ? 'default' : 'outline'}
          className={`h-12 w-12 rounded-xl relative ${isTTSEnabled ? 'bg-primary' : ''}`}
          onClick={() => {
            if (isSpeaking) {
              onStopSpeaking();
            } else {
              onToggleTTS(!isTTSEnabled);
            }
          }}
          title={isTTSEnabled ? 'Live speaking ON - Click to turn off' : 'Enable live speaking'}
        >
          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Volume2 className="w-5 h-5" />
                </motion.div>
              </motion.div>
            ) : isTTSEnabled ? (
              <motion.div
                key="enabled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Volume2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="disabled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <VolumeX className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Active indicator */}
          {isTTSEnabled && !isSpeaking && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </Button>
      )}

      {/* Settings popover */}
      {(isSTTSupported || isTTSSupported) && (
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-xl"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-popover" align="end" sideOffset={8}>
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Voice Settings</h4>
              
              {/* Language Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm">Language</Label>
                </div>
                <Select value={currentLanguage} onValueChange={onLanguageChange}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{currentLangInfo.flag}</span>
                        <span>{currentLangInfo.name}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-60">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice/Accent Selection */}
              {isTTSSupported && availableVoices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm">Voice & Accent</Label>
                  </div>
                  <Select 
                    value={selectedVoiceIndex?.toString() ?? 'auto'} 
                    onValueChange={(val) => onVoiceChange(val === 'auto' ? null : parseInt(val))}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue>
                        {currentVoice ? (
                          <span className="flex items-center gap-2">
                            <span className="truncate">{currentVoice.label}</span>
                            {currentVoice.isNatural && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">Natural</Badge>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Auto (Best available)</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover max-h-60">
                      <SelectItem value="auto">
                        <span className="text-muted-foreground">Auto (Best available)</span>
                      </SelectItem>
                      {availableVoices.map((voiceOption, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="truncate max-w-[180px]">{voiceOption.label}</span>
                            {voiceOption.isNatural && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">Natural</Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Test Voice Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={onTestVoice}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? 'Speaking...' : '🔊 Test Voice'}
                  </Button>
                </div>
              )}
              
              {isTTSSupported && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tts-toggle" className="text-sm">
                      Auto-read responses
                    </Label>
                    <Switch
                      id="tts-toggle"
                      checked={isTTSEnabled}
                      onCheckedChange={onToggleTTS}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Speech rate</Label>
                      <span className="text-xs text-muted-foreground">
                        {speechRate.toFixed(1)}x
                      </span>
                    </div>
                    <Slider
                      value={[speechRate]}
                      onValueChange={([value]) => onSpeechRateChange(value)}
                      min={0.5}
                      max={1.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {isSTTSupported && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Select your language and voice accent, then click the mic to speak. 
                  The bot will respond in your chosen voice!
                </p>
              )}
              
              {availableVoices.length === 0 && isTTSSupported && (
                <p className="text-xs text-destructive">
                  ⚠️ No voices available for this language. Try selecting a different language.
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
