import { Link, useLocation } from 'wouter';
import { useGetConversations } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Image as ImageIcon } from 'lucide-react';

export default function Conversations() {
  const [, setLocation] = useLocation();
  const { data: conversations, isLoading } = useGetConversations();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">المحادثات</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">المحادثات</h1>
        </div>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد محادثات نشطة</h3>
          <p className="text-muted-foreground mb-6">تبدأ المحادثات عند قبول طلبات التبديل.</p>
          <Button onClick={() => setLocation('/swap-requests')}>عرض طلبات التبديل</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <Card 
              key={conv.swapRequestId} 
              className={`overflow-hidden transition-all hover:shadow-md cursor-pointer border-l-4 ${conv.unreadCount > 0 ? 'border-l-primary bg-primary/5' : 'border-l-transparent'}`}
              onClick={() => setLocation(`/conversations/${conv.swapRequestId}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarImage src={conv.otherUser.avatarUrl || ''} />
                  <AvatarFallback className="bg-muted text-lg">{conv.otherUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold truncate pr-2 ${conv.unreadCount > 0 ? 'text-primary' : ''}`}>
                      {conv.otherUser.name}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {conv.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full px-1.5">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <span className="truncate">بشأن: {conv.listing.title}</span>
                  </div>
                  
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {conv.lastMessage || 'بدأت المحادثة'}
                  </p>
                </div>

                {conv.listing.images && conv.listing.images.length > 0 ? (
                  <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted border">
                    <img src={conv.listing.images[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-md bg-muted flex items-center justify-center border">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}