import { motion } from 'framer-motion';
import { Phone, Heart, MessageCircle, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';

const helplines = [
  {
    name: "iCall",
    number: "9152987821",
    description: "Psychosocial helpline by TISS",
    hours: "Mon-Sat: 8am-10pm",
    icon: Phone,
  },
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    description: "24/7 mental health support",
    hours: "24 hours, 7 days",
    icon: Heart,
  },
  {
    name: "AASRA",
    number: "9820466726",
    description: "Crisis intervention center",
    hours: "24 hours, 7 days",
    icon: Shield,
  },
  {
    name: "Snehi",
    number: "044-24640050",
    description: "Emotional support helpline",
    hours: "24 hours, 7 days",
    icon: MessageCircle,
  },
  {
    name: "NIMHANS",
    number: "080-46110007",
    description: "National mental health support",
    hours: "24 hours, 7 days",
    icon: Globe,
  },
];

const copingTips = [
  { emoji: "🌬️", tip: "Take slow, deep breaths. Inhale for 4, hold for 4, exhale for 4." },
  { emoji: "🎵", tip: "Listen to calming music or sounds of nature." },
  { emoji: "🚶", tip: "Go for a short walk, even just around your room." },
  { emoji: "💧", tip: "Drink a glass of water slowly and mindfully." },
  { emoji: "🤗", tip: "Reach out to someone you trust and talk to them." },
];

export default function EmergencyHelp() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Heart className="w-8 h-8 text-primary animate-pulse-soft" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're Not Alone 💙</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Help is available. Reaching out is a sign of strength, not weakness.
          </p>
        </motion.div>

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary/20 to-secondary/40 rounded-2xl p-6 text-center"
        >
          <p className="text-lg font-medium text-foreground mb-2">
            If you're in immediate danger, please call emergency services
          </p>
          <Button
            onClick={() => handleCall('112')}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-xl mt-2"
          >
            <Phone className="w-4 h-4 mr-2" />
            Call 112 (Emergency)
          </Button>
        </motion.div>

        {/* Helplines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Mental Health Helplines</h2>
          <div className="space-y-3">
            {helplines.map((helpline, index) => (
              <motion.div
                key={helpline.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <helpline.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{helpline.name}</h3>
                  <p className="text-sm text-muted-foreground">{helpline.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{helpline.hours}</p>
                </div>
                <Button
                  onClick={() => handleCall(helpline.number)}
                  size="sm"
                  className="rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coping Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Grounding Techniques</h2>
          <div className="glass-card p-5 space-y-4">
            {copingTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="text-xl">{tip.emoji}</span>
                <p className="text-foreground text-sm">{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6"
        >
          <p className="text-muted-foreground italic">
            "This too shall pass. You are stronger than you think." 💜
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
