import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Trash2, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (data) {
      setName(data.name || '');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated! ✨' });
    }
    setLoading(false);
  };

  const handleClearData = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      return;
    }

    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    await supabase.from('mood_entries').delete().eq('user_id', user.id);
    await supabase.from('gratitude_entries').delete().eq('user_id', user.id);
    await supabase.from('saved_quotes').delete().eq('user_id', user.id);

    toast({ title: 'All data cleared', description: 'Your data has been removed.' });
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <h1 className="text-2xl font-bold text-foreground">Settings ⚙️</h1>
          <p className="text-muted-foreground mt-1">Manage your profile</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">😊</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 rounded-xl"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 rounded-xl bg-muted"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-foreground mb-4">Data & Privacy</h2>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your data is stored securely and privately. Only you can access your mood entries, journal, and chat history.
            </p>

            <Button
              variant="outline"
              onClick={handleClearData}
              className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All My Data
            </Button>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="font-semibold text-foreground mb-4">Account</h2>
          
          <Button
            variant="outline"
            onClick={signOut}
            className="w-full rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
        >
          <p className="text-sm text-muted-foreground">
            MindfulMe v1.0 💙
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your wellness companion
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
