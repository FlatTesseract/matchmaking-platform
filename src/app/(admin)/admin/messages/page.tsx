'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import {
  MessageCircle,
  Search,
  Send,
  MoreVertical,
  User,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed');
    return r.json();
  });

interface ConversationItem {
  id: string;
  participantName: string;
  participantPhoto: string;
  participantId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isFromMatchmaker: boolean;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (diffInHours < 48) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function formatFullTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: ConversationItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-4 text-left transition-colors',
        isSelected ? 'bg-[#F5E0E8]' : 'hover:bg-[#FFF8F0]'
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-lg">
          {conversation.participantName.charAt(0)}
        </div>
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7B1E3A] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              'font-semibold truncate',
              conversation.unreadCount > 0 ? 'text-[#2D1318]' : 'text-[#6B5B5E]'
            )}
          >
            {conversation.participantName}
          </h3>
          <span className="text-xs text-[#6B5B5E] flex-shrink-0 ml-2">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm truncate',
            conversation.unreadCount > 0 ? 'text-[#2D1318]' : 'text-[#6B5B5E]'
          )}
        >
          {conversation.lastMessage}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: MessageItem }) {
  const isAdmin = message.isFromMatchmaker;

  return (
    <div
      className={cn(
        'flex mb-4',
        isAdmin ? 'justify-end' : 'justify-start'
      )}
    >
      {!isAdmin && (
        <div className="w-8 h-8 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold text-xs mr-2 mt-1 flex-shrink-0">
          {message.senderName.charAt(0)}
        </div>
      )}
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-3',
          isAdmin
            ? 'bg-[#7B1E3A] text-white rounded-br-md'
            : 'bg-[#F5E0E8] text-[#2D1318] rounded-bl-md'
        )}
      >
        {!isAdmin && (
          <p className="text-xs font-semibold text-[#7B1E3A] mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isAdmin ? 'text-white/70' : 'text-[#6B5B5E]'
          )}
        >
          {formatFullTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const {
    data: convoData,
    error: convoError,
    isLoading: convoLoading,
    mutate: mutateConversations,
  } = useSWR<{ conversations: ConversationItem[] }>('/api/messages', fetcher, {
    refreshInterval: 15000,
  });

  // Fetch messages for selected conversation
  const {
    data: msgData,
    error: msgError,
    isLoading: msgLoading,
    mutate: mutateMessages,
  } = useSWR<{ messages: MessageItem[] }>(
    selectedConversationId ? `/api/messages/${selectedConversationId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const conversations = convoData?.conversations || [];
  const messages = msgData?.messages || [];

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    const content = newMessage.trim();
    setSending(true);
    setNewMessage('');

    try {
      const res = await fetch(`/api/messages/${selectedConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      mutateMessages();
      mutateConversations();
    } catch {
      toast.error('Failed to send message', {
        description: 'Please try again.',
      });
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowMobileList(false);
  };

  // Loading state
  if (convoLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#7B1E3A] animate-spin mx-auto mb-4" />
          <p className="text-[#6B5B5E]">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (convoError) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2D1318] mb-2">Failed to Load</h2>
          <p className="text-[#6B5B5E]">
            Could not load conversations. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-serif text-[#2D1318] flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-[#7B1E3A]" />
          Messages
          {totalUnread > 0 && (
            <Badge className="bg-[#7B1E3A] text-white">{totalUnread} unread</Badge>
          )}
        </h1>
        <p className="text-[#6B5B5E] mt-1">
          Communicate with users and facilitate introductions.
        </p>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F5E0E8]/50 overflow-hidden h-[calc(100%-6rem)]">
        <div className="flex h-full">
          {/* Conversation List */}
          <div
            className={cn(
              'w-full md:w-80 border-r border-[#F5E0E8] flex flex-col',
              !showMobileList && 'hidden md:flex'
            )}
          >
            {/* Search */}
            <div className="p-4 border-b border-[#F5E0E8]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5B5E]" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-[#E3C4A8]"
                />
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-[#F5E0E8]">
                {filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onClick={() => selectConversation(conversation.id)}
                  />
                ))}
                {filteredConversations.length === 0 && (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-[#F5E0E8] mx-auto mb-3" />
                    <p className="text-[#6B5B5E]">
                      {conversations.length === 0
                        ? 'No conversations yet'
                        : 'No conversations found'}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              'flex-1 flex flex-col',
              showMobileList && 'hidden md:flex'
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#F5E0E8] flex items-center justify-between bg-[#FFF8F0]">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setShowMobileList(true)}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-[#F5E0E8] flex items-center justify-center text-[#7B1E3A] font-bold">
                      {selectedConversation.participantName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#2D1318]">
                        {selectedConversation.participantName}
                      </h2>
                      <p className="text-xs text-[#6B5B5E] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active {formatTime(selectedConversation.lastMessageAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#6B5B5E] hover:text-[#7B1E3A] hover:bg-[#F5E0E8]"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#6B5B5E] hover:text-[#7B1E3A] hover:bg-[#F5E0E8]"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-[#7B1E3A] animate-spin" />
                    </div>
                  ) : msgError ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-[#6B5B5E] text-sm">Failed to load messages</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-[#F5E0E8] mx-auto mb-3" />
                        <p className="text-[#6B5B5E]">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-[#F5E0E8] bg-[#FFF8F0]">
                  <div className="flex items-end gap-3">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 border-[#E3C4A8] focus:border-[#7B1E3A] resize-none min-h-[44px] max-h-32"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-[#7B1E3A] hover:bg-[#5C1229] text-white h-11 px-4"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-[#6B5B5E] mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-[#F5E0E8] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-[#2D1318] mb-2">
                    Select a Conversation
                  </h2>
                  <p className="text-[#6B5B5E]">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
