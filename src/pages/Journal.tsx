import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface GratitudeEntry {
  id: string;
  entry_1: string;
  entry_2: string | null;
  entry_3: string | null;
  created_at: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [entry1, setEntry1] = useState('');
  const [entry2, setEntry2] = useState('');
  const [entry3, setEntry3] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('gratitude_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!entry1.trim()) {
      toast({ title: 'Please write at least one thing you\'re grateful for', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('gratitude_entries').insert({
      user_id: user?.id,
      entry_1: entry1.trim(),
      entry_2: entry2.trim() || null,
      entry_3: entry3.trim() || null,
    });

    if (error) {
      toast({ title: 'Failed to save entry', variant: 'destructive' });
    } else {
      toast({ title: 'Entry saved! 🌸', description: 'Keep up the gratitude practice!' });
      setEntry1('');
      setEntry2('');
      setEntry3('');
      setIsWriting(false);
      loadEntries();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('gratitude_entries').delete().eq('id', id);
    loadEntries();
    toast({ title: 'Entry deleted' });
  };

  const todayEntry = entries.find(e => 
    format(new Date(e.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4 animate-float">
            <BookHeart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Gratitude Journal 📔</h1>
          <p className="text-muted-foreground mt-1">What are you grateful for today?</p>
        </motion.div>

        {/* Today's Entry or Write New */}
        <AnimatePresence mode="wait">
          {isWriting ? (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Write 3 things you're grateful for today</span>
              </div>

              {[
                { value: entry1, setter: setEntry1, num: 1 },
                { value: entry2, setter: setEntry2, num: 2 },
                { value: entry3, setter: setEntry3, num: 3 },
              ].map(({ value, setter, num }) => (
                <div key={num} className="relative">
                  <span className="absolute left-3 top-3 text-lg">{num}.</span>
                  <Textarea
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={`I'm grateful for...`}
                    className="pl-10 min-h-[80px] rounded-xl resize-none"
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsWriting(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !entry1.trim()}
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                >
                  {saving ? 'Saving...' : 'Save Entry 💜'}
                </Button>
              </div>
            </motion.div>
          ) : todayEntry ? (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Today's Gratitude ✨</h3>
                <span className="text-sm text-muted-foreground">{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
              <ul className="space-y-3">
                {[todayEntry.entry_1, todayEntry.entry_2, todayEntry.entry_3]
                  .filter(Boolean)
                  .map((entry, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary">💜</span>
                      <span className="text-foreground">{entry}</span>
                    </li>
                  ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌸</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Start your gratitude practice</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Taking a moment to appreciate the good things in life can boost your mood and wellbeing.
              </p>
              <Button
                onClick={() => setIsWriting(true)}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Today's Entry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add button if already wrote today */}
        {todayEntry && !isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              onClick={() => setIsWriting(true)}
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Entry
            </Button>
          </motion.div>
        )}

        {/* Past Entries */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-foreground mb-4">Past Entries</h3>
            <div className="space-y-3">
              {entries
                .filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd'))
                .map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {format(new Date(entry.created_at), 'EEEE, MMM d')}
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {[entry.entry_1, entry.entry_2, entry.entry_3]
                        .filter(Boolean)
                        .map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
