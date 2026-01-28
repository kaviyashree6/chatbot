import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Smile, Frown, Meh, Zap, Cloud, Brain } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  created_at: string;
}

const moodConfig = {
  happy: { color: 'hsl(45, 93%, 77%)', icon: Smile, emoji: '😊' },
  calm: { color: 'hsl(172, 66%, 76%)', icon: Cloud, emoji: '😌' },
  sad: { color: 'hsl(216, 77%, 79%)', icon: Frown, emoji: '😢' },
  stressed: { color: 'hsl(0, 68%, 82%)', icon: Zap, emoji: '😣' },
  anxious: { color: 'hsl(280, 55%, 82%)', icon: Brain, emoji: '😰' },
  neutral: { color: 'hsl(210, 20%, 85%)', icon: Meh, emoji: '😐' },
};

export default function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMoodData();
    }
  }, [user]);

  const loadMoodData = async () => {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', startOfDay(sevenDaysAgo).toISOString())
      .lte('created_at', endOfDay(new Date()).toISOString())
      .order('created_at', { ascending: true });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const logMood = async (mood: string) => {
    if (!user) return;

    await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood,
      intensity: 5,
    });

    loadMoodData();
  };

  // Calculate mood distribution
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood,
    value: count,
    color: moodConfig[mood as keyof typeof moodConfig]?.color || '#ccc',
  }));

  // Calculate daily mood counts
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayEntries = entries.filter(e => 
      format(new Date(e.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    const moodForDay: Record<string, number> = {};
    dayEntries.forEach(e => {
      moodForDay[e.mood] = (moodForDay[e.mood] || 0) + 1;
    });

    return {
      day: format(date, 'EEE'),
      happy: moodForDay.happy || 0,
      calm: moodForDay.calm || 0,
      sad: moodForDay.sad || 0,
      stressed: moodForDay.stressed || 0,
      anxious: moodForDay.anxious || 0,
      neutral: moodForDay.neutral || 0,
    };
  });

  // Get dominant mood
  const dominantMood = pieData.length > 0 
    ? pieData.reduce((a, b) => a.value > b.value ? a : b).name 
    : null;

  const positiveDays = entries.filter(e => ['happy', 'calm'].includes(e.mood)).length;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <h1 className="text-2xl font-bold text-foreground">Mood Tracker 📊</h1>
          <p className="text-muted-foreground mt-1">Track how you're feeling</p>
        </motion.div>

        {/* Quick Mood Log */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-foreground mb-4">How are you feeling right now?</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(moodConfig).map(([mood, config]) => (
              <button
                key={mood}
                onClick={() => logMood(mood)}
                className={`mood-card mood-${mood} flex flex-col items-center gap-2 p-4`}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-sm font-medium capitalize">{mood}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-happy/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-happy-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Mood logs this week</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-calm/30 flex items-center justify-center">
                <Smile className="w-6 h-6 text-calm-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{positiveDays}</p>
                <p className="text-sm text-muted-foreground">Positive moments</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">
                  {dominantMood ? moodConfig[dominantMood as keyof typeof moodConfig]?.emoji : '🌟'}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground capitalize">{dominantMood || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Dominant mood</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Encouragement */}
        {positiveDays > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-r from-happy/20 to-calm/20 rounded-2xl p-5 text-center"
          >
            <p className="text-foreground font-medium">
              🌟 You had {positiveDays} positive {positiveDays === 1 ? 'moment' : 'moments'} this week — great job! Keep it up! 💪
            </p>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">Weekly Overview</h3>
            {entries.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="happy" fill={moodConfig.happy.color} stackId="stack" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="calm" fill={moodConfig.calm.color} stackId="stack" />
                  <Bar dataKey="neutral" fill={moodConfig.neutral.color} stackId="stack" />
                  <Bar dataKey="anxious" fill={moodConfig.anxious.color} stackId="stack" />
                  <Bar dataKey="sad" fill={moodConfig.sad.color} stackId="stack" />
                  <Bar dataKey="stressed" fill={moodConfig.stressed.color} stackId="stack" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <p>Log some moods to see your chart!</p>
              </div>
            )}
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold text-foreground mb-4">Mood Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => moodConfig[name as keyof typeof moodConfig]?.emoji}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <p>No mood data yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
