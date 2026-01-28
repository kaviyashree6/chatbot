import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  content: string;
  title?: string;
}

export function ShareButton({ content, title = 'MindfulMe Chat' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareText = `${title}\n\n${content}`;
  const encodedText = encodeURIComponent(shareText);

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Message copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: content,
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-60 hover:opacity-100"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={shareToWhatsApp}
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            WhatsApp
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy text'}
          </Button>

          {navigator.share && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={shareNative}
            >
              <Share2 className="h-4 w-4" />
              More options
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
