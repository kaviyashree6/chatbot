import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useConversations } from '@/hooks/use-conversations';
import { VoiceControls } from '@/components/chat/VoiceControls';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatHistory } from '@/components/chat/ChatHistory';

const distressKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'worthless', 'hopeless', "can't go on", 'self harm', 'hurt myself'];

export default function Chat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Conversations hook
  const {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    isLoading: isConversationsLoading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    selectConversation,
    startNewConversation,
  } = useConversations();

  // Voice hooks with language support
  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking, 
    isSupported: isTTSSupported,
    changeLang: changeTTSLang,
    selectedVoiceIndex,
    selectVoice,
    getVoicesForLanguage,
  } = useTextToSpeech({ rate: speechRate, lang: currentLanguage });
  
  const { 
    isListening, 
    transcript, 
    interimTranscript,
    isSupported: isSTTSupported, 
    startListening, 
    stopListening,
    resetTranscript,
    changeLang: changeSTTLang 
  } = useSpeechRecognition({ lang: currentLanguage });

  // Get available voices for current language
  const availableVoices = getVoicesForLanguage();

  // Handle language change for both TTS and STT
  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    changeTTSLang(lang);
    changeSTTLang(lang);
  };

  // Test voice with sample text
  const handleTestVoice = () => {
    const testMessages: Record<string, string> = {
      'en-US': "Hello! I'm your wellness companion.",
      'en-GB': "Hello! I'm your wellness companion.",
      'en-AU': "Hello! I'm your wellness companion.",
      'en-IN': "Hello! I'm your wellness companion.",
      'es-ES': "¡Hola! Soy tu compañero de bienestar.",
      'es-MX': "¡Hola! Soy tu compañero de bienestar.",
      'fr-FR': "Bonjour! Je suis votre compagnon de bien-être.",
      'de-DE': "Hallo! Ich bin dein Wellness-Begleiter.",
      'it-IT': "Ciao! Sono il tuo compagno di benessere.",
      'pt-BR': "Olá! Eu sou seu companheiro de bem-estar.",
      'pt-PT': "Olá! Eu sou o seu companheiro de bem-estar.",
      'zh-CN': "你好！我是你的健康伴侣。",
      'ja-JP': "こんにちは！私はあなたのウェルネスコンパニオンです。",
      'ko-KR': "안녕하세요! 저는 당신의 웰니스 동반자입니다.",
      'hi-IN': "नमस्ते! मैं आपका वेलनेस साथी हूं।",
      'ta-IN': "வணக்கம்! நான் உங்கள் நல்வாழ்வு தோழன்.",
      'ar-SA': "مرحباً! أنا رفيقك في الصحة.",
      'ru-RU': "Привет! Я ваш компаньон по здоровью.",
    };
    const testText = testMessages[currentLanguage] || testMessages['en-US'];
    speak(testText);
  };

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const checkForDistress = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return distressKeywords.some(keyword => lowerText.includes(keyword));
  };

  const extractEmotion = (text: string): string | undefined => {
    const emotionMatch = text.match(/\[EMOTION:\s*(happy|calm|sad|stressed|anxious|neutral)\]/i);
    return emotionMatch ? emotionMatch[1].toLowerCase() : undefined;
  };

  const cleanContent = (text: string): string => {
    return text.replace(/\[EMOTION:\s*(happy|calm|sad|stressed|anxious|neutral)\]/gi, '').trim();
  };

  const handleSpeak = (text: string, messageId?: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setCurrentSpeakingId(null);
    }
    speak(text);
    if (messageId) {
      setCurrentSpeakingId(messageId);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setCurrentSpeakingId(null);
  };

  // Reset current speaking ID when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentSpeakingId(null);
    }
  }, [isSpeaking]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    resetTranscript();

    // Check for distress
    if (checkForDistress(userMessage)) {
      setShowEmergency(true);
    }

    // Create conversation if needed
    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) {
        toast({
          title: 'Error',
          description: 'Could not start conversation',
          variant: 'destructive',
        });
        return;
      }
    }

    const userMsgId = crypto.randomUUID();
    const userMsg = {
      id: userMsgId,
      role: 'user' as const,
      content: userMessage,
    };

    setMessages(prev => [...prev, userMsg]);
    await addMessage('user', userMessage, conversationId);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId = crypto.randomUUID();

      // Add placeholder message
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: cleanContent(assistantContent) }
                      : m
                  )
                );
              }
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      }

      const detectedEmotion = extractEmotion(assistantContent);
      const cleanedContent = cleanContent(assistantContent);

      // Update with final content and emotion
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: cleanedContent, detected_emotion: detectedEmotion }
            : m
        )
      );

      await addMessage('assistant', cleanedContent, conversationId, detectedEmotion);

      // Update conversation title based on first message
      if (messages.length === 0) {
        const title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
        await updateConversationTitle(conversationId, title);
      }

      // Auto-speak if TTS is enabled
      if (isTTSEnabled && cleanedContent) {
        handleSpeak(cleanedContent, assistantId);
      }

      // Save mood entry if emotion detected
      if (detectedEmotion && user) {
        await supabase.from('mood_entries').insert({
          user_id: user.id,
          mood: detectedEmotion,
          intensity: 5,
          note: 'Detected from chat',
        });
      }

    } catch (error: any) {
      toast({
        title: 'Unable to send message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Chat History Button */}
              <ChatHistory
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={selectConversation}
                onNewConversation={startNewConversation}
                onDeleteConversation={deleteConversation}
                isLoading={isConversationsLoading}
              />
              
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">MindfulMe</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Your wellness companion
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* New Chat Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
              
              {/* Voice status indicators */}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-destructive"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                  <span className="hidden sm:inline">Listening...</span>
                </motion.div>
              )}
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  />
                  <span className="hidden sm:inline">Speaking...</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        <AnimatePresence>
          {showEmergency && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-destructive/10 border-b border-destructive/20"
            >
              <div className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <p className="text-sm text-foreground flex-1">
                  You're not alone 💙 Help is available.
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => navigate('/help')}
                  className="shrink-0"
                >
                  Get Help
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {currentConversationId ? 'Continue your conversation' : 'Hi there! 👋'}
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                I'm here to listen and support you. How are you feeling today?
              </p>
              {(isSTTSupported || isTTSSupported) && (
                <p className="text-sm text-muted-foreground">
                  🎤 Voice features available! Click the mic to speak.
                </p>
              )}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                detected_emotion={message.detected_emotion}
                isSpeaking={currentSpeakingId === message.id && isSpeaking}
                onSpeak={(text) => handleSpeak(text, message.id)}
                onStopSpeaking={handleStopSpeaking}
                isTTSSupported={isTTSSupported}
              />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-bot">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          {/* Interim transcript display */}
          {isListening && interimTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 p-2 rounded-lg bg-muted/50 text-sm text-muted-foreground italic"
            >
              {interimTranscript}...
            </motion.div>
          )}
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <VoiceControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              isTTSEnabled={isTTSEnabled}
              isSTTSupported={isSTTSupported}
              isTTSSupported={isTTSSupported}
              speechRate={speechRate}
              currentLanguage={currentLanguage}
              selectedVoiceIndex={selectedVoiceIndex}
              availableVoices={availableVoices}
              onStartListening={startListening}
              onStopListening={stopListening}
              onStopSpeaking={handleStopSpeaking}
              onToggleTTS={setIsTTSEnabled}
              onSpeechRateChange={setSpeechRate}
              onLanguageChange={handleLanguageChange}
              onVoiceChange={selectVoice}
              onTestVoice={handleTestVoice}
            />
            
            <Input
              value={isListening ? (transcript + interimTranscript) : input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type your message..."}
              className="flex-1 h-12 rounded-xl"
              disabled={isLoading || isListening}
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
