import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButton } from './ShareButton';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detected_emotion?: string;
  isSpeaking?: boolean;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  isTTSSupported?: boolean;
}

export function ChatMessage({
  role,
  content,
  detected_emotion,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
  isTTSSupported,
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] ${
          role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
        }`}
      >
        <div className="flex items-start gap-2">
          <p className="text-foreground whitespace-pre-wrap flex-1">{content}</p>
          
          <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-1">
            {/* Share button */}
            {content && (
              <ShareButton 
                content={content} 
                title={role === 'assistant' ? '💙 MindfulMe says:' : '💬 I shared:'} 
              />
            )}
            
            {/* TTS button for assistant messages */}
            {role === 'assistant' && isTTSSupported && content && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-60 hover:opacity-100"
                onClick={() => {
                  if (isSpeaking) {
                    onStopSpeaking?.();
                  } else {
                    onSpeak?.(content);
                  }
                }}
              >
                {isSpeaking ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <VolumeX className="h-3.5 w-3.5" />
                  </motion.div>
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {detected_emotion && (
          <p className="text-xs text-muted-foreground mt-2 capitalize">
            Feeling: {detected_emotion}
          </p>
        )}
      </div>
    </motion.div>
  );
}
