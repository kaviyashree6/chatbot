import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, BarChart3, BookHeart, Sun, AlertTriangle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/mood', icon: BarChart3, label: 'Mood' },
  { to: '/journal', icon: BookHeart, label: 'Journal' },
  { to: '/motivation', icon: Sun, label: 'Daily' },
  { to: '/help', icon: AlertTriangle, label: 'Help' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-20">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border md:hidden z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Side nav for desktop */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card/95 backdrop-blur-xl border-r border-border flex-col items-center py-6 gap-2 z-50">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
          <span className="text-2xl">🧠</span>
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all w-16",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        <div className="flex-1" />
        
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-16"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}
