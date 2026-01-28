import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detected_emotion?: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const { user } = useAuth();

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
    setIsLoading(false);
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    setIsMessagesLoading(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        detected_emotion: m.detected_emotion || undefined,
      })));
    }
    setIsMessagesLoading(false);
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: title || 'New Chat',
      })
      .select()
      .single();

    if (!error && data) {
      setConversations(prev => [data, ...prev]);
      setCurrentConversationId(data.id);
      setMessages([]);
      return data.id;
    }
    return null;
  }, [user]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (!error) {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, title, updated_at: new Date().toISOString() }
            : c
        )
      );
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  }, [currentConversationId]);

  // Add a message
  const addMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    conversationId: string,
    detected_emotion?: string
  ): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        role,
        content,
        detected_emotion,
      })
      .select()
      .single();

    if (!error && data) {
      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data.id;
    }
    return null;
  }, [user]);

  // Select a conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  }, [loadMessages]);

  // Start new conversation
  const startNewConversation = useCallback(async () => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Initialize
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  return {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    isLoading,
    isMessagesLoading,
    loadConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    selectConversation,
    startNewConversation,
  };
}
