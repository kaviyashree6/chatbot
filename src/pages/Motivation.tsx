import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Share2, Sun, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Be kind to yourself. You're doing the best you can.", author: "Unknown" },
  { text: "Every day is a new beginning. Take a deep breath, smile, and start again.", author: "Unknown" },
  { text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.", author: "Unknown" },
];

export default function Motivation() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Get random quote for today based on date
    const today = new Date().toDateString();
    const index = Math.abs(today.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % quotes.length;
    setCurrentQuote(quotes[index]);
    loadSavedQuotes();
  }, []);

  const loadSavedQuotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_quotes')
      .select('quote')
      .eq('user_id', user.id);
    if (data) {
      setSavedQuotes(data.map(d => d.quote));
    }
  };

  const refreshQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  const saveQuote = async () => {
    if (!user) return;
    
    if (savedQuotes.includes(currentQuote.text)) {
      toast({ title: 'Already saved!', description: 'This quote is in your collection.' });
      return;
    }

    const { error } = await supabase.from('saved_quotes').insert({
      user_id: user.id,
      quote: currentQuote.text,
      author: currentQuote.author,
    });

    if (!error) {
      setSavedQuotes([...savedQuotes, currentQuote.text]);
      toast({ title: 'Quote saved! 💜', description: 'Added to your collection.' });
    }
  };

  const shareQuote = async () => {
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard! 📋' });
    }
  };

  const isSaved = savedQuotes.includes(currentQuote.text);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4 mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-happy/30 mb-4 animate-float">
            <Sun className="w-8 h-8 text-happy-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Daily Motivation 🌅</h1>
          <p className="text-muted-foreground mt-1">Start your day with positivity</p>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? 20 : 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
              >
                {/* Decorative quotes */}
                <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/20" />
                <Quote className="absolute bottom-4 right-4 w-8 h-8 text-primary/20 rotate-180" />

                <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6 relative z-10">
                  "{currentQuote.text}"
                </p>
                <p className="text-muted-foreground font-medium">
                  — {currentQuote.author}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="lg"
                onClick={refreshQuote}
                className="rounded-xl gap-2"
                disabled={isAnimating}
              >
                <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
                New Quote
              </Button>
              <Button
                variant={isSaved ? "secondary" : "outline"}
                size="lg"
                onClick={saveQuote}
                className="rounded-xl gap-2"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-destructive' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={shareQuote}
                className="rounded-xl gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Saved Quotes Preview */}
        {savedQuotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pb-4"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
              💜 {savedQuotes.length} saved {savedQuotes.length === 1 ? 'quote' : 'quotes'}
            </h3>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
