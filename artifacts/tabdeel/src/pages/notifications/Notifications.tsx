import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, NotificationType } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, ArrowRightLeft, Star, MessageCircle, Info } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.swap_request:
    case NotificationType.swap_accepted:
    case NotificationType.swap_rejected:
      return <ArrowRightLeft className="h-5 w-5" />;
    case NotificationType.new_message:
      return <MessageCircle className="h-5 w-5" />;
    case NotificationType.rating:
      return <Star className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.swap_accepted:
      return 'bg-emerald-500/10 text-emerald-600';
    case NotificationType.swap_rejected:
      return 'bg-destructive/10 text-destructive';
    case NotificationType.swap_request:
      return 'bg-amber-500/10 text-amber-600';
    case NotificationType.new_message:
      return 'bg-blue-500/10 text-blue-600';
    case NotificationType.rating:
      return 'bg-accent/10 text-accent';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function Notifications() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useGetNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('تم تحديد جميع الإشعارات كمقروءة');
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate({ id: notification.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        }
      });
    }

    if (notification.relatedId) {
      if (notification.type === NotificationType.new_message || notification.type.startsWith('swap_')) {
        setLocation(`/swap-requests`);
      } else if (notification.type === NotificationType.rating) {
        setLocation('/profile');
      }
    }
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Bell className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending} className="gap-2">
            <Check className="h-4 w-4" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
          <p className="text-muted-foreground">أنت على اطلاع بكل جديد!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications?.map(notification => (
            <Card 
              key={notification.id} 
              className={`overflow-hidden transition-colors cursor-pointer hover:bg-muted/50 ${!notification.isRead ? 'border-r-4 border-r-primary bg-primary/5' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4 sm:p-5 flex gap-4 items-start">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString('ar-JO')}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notification.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
