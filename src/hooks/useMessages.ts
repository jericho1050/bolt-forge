import { useState, useEffect } from 'react';
import { supabase, Conversation, Message } from '../lib/supabase';

export function useConversations(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_1:profiles!conversations_participant_1_id_fkey(*),
          participant_2:profiles!conversations_participant_2_id_fkey(*),
          project:projects(*),
          messages(
            *,
            sender:profiles(*)
          )
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setConversations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    if (!userId) return;

    const subscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1_id=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_2_id=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const createConversation = async (otherUserId: string, projectId?: string) => {
    if (!userId) return { error: new Error('No user ID provided') };

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(participant_1_id.eq.${userId},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${userId})`
        )
        .eq('project_id', projectId || null)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            participant_1_id: userId,
            participant_2_id: otherUserId,
            project_id: projectId,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await fetchConversations();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to create conversation') };
    }
  };

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
  };
}

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (content: string, senderId: string) => {
    if (!conversationId) return { error: new Error('No conversation ID provided') };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            message_type: 'text',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Failed to send message') };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to mark message as read') };
    }
  };

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    sendMessage,
    markAsRead,
  };
}