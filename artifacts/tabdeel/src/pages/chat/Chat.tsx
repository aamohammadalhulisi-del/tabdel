import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  useGetMessages, 
  getGetMessagesQueryKey,
  useSendMessage, 
  useMarkConversationRead,
  useGetSwapRequests,
  getGetSwapRequestsQueryKey,
  GetSwapRequestsType
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Chat() {
  const [, params] = useRoute('/conversations/:id');
  const swapRequestId = parseInt(params?.id || '0');
console.log("CHAT ID:", swapRequestId);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [newMessage, setNewMessage] = useState('');

  // Fetch messages
  const { data: messages, isLoading: isMessagesLoading } = useGetMessages(swapRequestId, {
    query: {
      enabled: !!swapRequestId,
      refetchInterval: 5000,
      queryKey: getGetMessagesQueryKey(swapRequestId),
    }
  });

  const receivedParams = { type: GetSwapRequestsType.received };
  const sentParams = { type: GetSwapRequestsType.sent };
  const { data: receivedReqs } = useGetSwapRequests(
    receivedParams,
    { query: { queryKey: getGetSwapRequestsQueryKey(receivedParams) } }
  );
  const { data: sentReqs } = useGetSwapRequests(
    sentParams,
    { query: { queryKey: getGetSwapRequestsQueryKey(sentParams) } }
  );

  const allReqs = [...(receivedReqs || []), ...(sentReqs || [])];
  const swapRequest = allReqs.find(req => req.id === swapRequestId);
  
  const otherUser = swapRequest 
    ? (swapRequest.requester.id === user?.id ? swapRequest.listing.owner : swapRequest.requester)
    : null;

  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkConversationRead();

  // Mark as read when entering
  useEffect(() => {
    if (swapRequestId) {
      markReadMutation.mutate({ swapRequestId });
    }
  }, [swapRequestId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate(
      { swapRequestId, data: { content: newMessage } },
      {
        onSuccess: (newMsg) => {
          setNewMessage('');
          // Optimistically update
          queryClient.setQueryData(
            [`/api/swap-requests/${swapRequestId}/messages`],
            (old: any) => old ? [...old, newMsg] : [newMsg]
          );
        }
      }
    );
  };

  if (isMessagesLoading && !messages) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full border-x">
        <div className="h-16 border-b flex items-center px-4 bg-muted animate-pulse"></div>
        <div className="flex-1 p-4 space-y-4">
          <div className="h-12 w-1/2 bg-muted animate-pulse rounded-2xl rounded-tr-none self-end ml-auto"></div>
          <div className="h-12 w-1/2 bg-muted animate-pulse rounded-2xl rounded-tl-none"></div>
          <div className="h-12 w-1/3 bg-muted animate-pulse rounded-2xl rounded-tr-none self-end ml-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] max-w-4xl mx-auto w-full bg-background sm:border-x border-border/50 shadow-sm relative">
      {/* Header */}
      <header className="h-16 sm:h-20 border-b flex items-center px-4 gap-4 bg-card shrink-0 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/conversations')} className="shrink-0">
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        {otherUser ? (
          <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors" onClick={() => setLocation(`/profile/${otherUser.id}`)}>
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={otherUser.avatarUrl || ''} />
              <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold truncate">{otherUser.name}</span>
              {swapRequest && (
                <span className="text-xs text-muted-foreground truncate">
                  بشأن: {swapRequest.listing.title}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <span className="font-semibold">محادثة</span>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
        <div className="flex flex-col gap-4">
          {messages?.length === 0 && (
             <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-dashed my-auto">
              أرسل رسالة للبدء بالمحادثة
            </div>
          )}
          
          {messages?.map((msg, index) => {
            const isMe = msg.sender.id === user?.id;
            const showAvatar = !isMe && (index === 0 || messages[index - 1].sender.id === user?.id);

            return (
              <div key={msg.id} className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${isMe ? 'self-end mr-auto' : 'self-start'}`}>
                {!isMe && (
                  <div className="w-8 shrink-0 flex items-end">
                    {showAvatar && (
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={msg.sender.avatarUrl || ''} />
                        <AvatarFallback className="text-[10px]">{msg.sender.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm sm:text-base ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card border border-border rounded-bl-sm'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Attachment" className="max-w-[200px] rounded-lg mb-2 border border-border/20" />
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t bg-card shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto bg-background border rounded-full p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
          <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-full text-muted-foreground hover:text-foreground">
            <ImageIcon className="h-5 w-5" />
          </Button>
          
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..." 
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 shadow-none px-2 h-10 text-base"
            dir="rtl"
          />
          
          <Button 
            type="submit" 
            size="icon" 
            className={`shrink-0 h-10 w-10 rounded-full transition-all ${newMessage.trim() ? 'bg-primary hover:bg-primary/90 text-primary-foreground scale-100' : 'bg-muted text-muted-foreground scale-95 opacity-80'}`}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:rotate-180" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
