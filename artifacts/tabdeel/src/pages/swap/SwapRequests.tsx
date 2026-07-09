import { useGetSwapRequests, getGetSwapRequestsQueryKey, useAcceptSwapRequest, useRejectSwapRequest, useCompleteSwapRequest, GetSwapRequestsType, SwapRequestStatus } from '@workspace/api-client-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle2, XCircle, ArrowRightLeft, Image as ImageIcon, MessageSquare, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  accepted: { label: 'مقبول', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
  rejected: { label: 'مرفوض', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  completed: { label: 'مكتمل', color: 'bg-blue-500/10 text-blue-600', icon: ArrowRightLeft },
};

export default function SwapRequests() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const receivedParams = { type: GetSwapRequestsType.received };
  const sentParams = { type: GetSwapRequestsType.sent };

  const { data: receivedRequests, isLoading: isLoadingReceived } = useGetSwapRequests(
    receivedParams,
    { query: { queryKey: getGetSwapRequestsQueryKey(receivedParams) } }
  );

  const { data: sentRequests, isLoading: isLoadingSent } = useGetSwapRequests(
    sentParams,
    { query: { queryKey: getGetSwapRequestsQueryKey(sentParams) } }
  );

  const acceptMutation = useAcceptSwapRequest();
  const rejectMutation = useRejectSwapRequest();
  const completeMutation = useCompleteSwapRequest();

  const handleAction = (action: 'accept' | 'reject' | 'complete', id: number) => {
    const mutation = action === 'accept' ? acceptMutation : action === 'reject' ? rejectMutation : completeMutation;
    const actionName = action === 'accept' ? 'قبول' : action === 'reject' ? 'رفض' : 'إكمال';
    
    mutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(`تم ${actionName} الطلب بنجاح`);
          // Note: Ideally invalidate the query, or we can rely on manual refetch if the component remounts
          // The proper way is queryClient.invalidateQueries({ queryKey: getGetSwapRequestsQueryKey({ type: 'received' }) })
          // which requires importing the key generator
          queryClient.invalidateQueries({ queryKey: ['/api/swap-requests'] });
        },
        onError: () => {
          toast.error(`حدث خطأ أثناء ${actionName} الطلب`);
        }
      }
    );
  };

  const RequestList = ({ requests, type, isLoading }: { requests: any[], type: 'received' | 'sent', isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl"></div>)}
        </div>
      );
    }

    if (!requests || requests.length === 0) {
      return (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <ArrowRightLeft className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
          <p className="text-muted-foreground">لا يوجد لديك أي طلبات {type === 'received' ? 'مستلمة' : 'مرسلة'} حالياً.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map(request => {
          const status = statusMap[request.status];
          const StatusIcon = status.icon;
          const isReceived = type === 'received';
          const otherUser = isReceived ? request.requester : request.listing.owner;

          return (
            <Card key={request.id} className="overflow-hidden transition-all hover:shadow-md border-border/60">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Listing Image */}
                  <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted shrink-0 relative cursor-pointer" onClick={() => setLocation(`/listings/${request.listing.id}`)}>
                    {request.listing.images && request.listing.images.length > 0 ? (
                      <img src={request.listing.images[0]} alt={request.listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <Badge className={status.color} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link href={`/listings/${request.listing.id}`}>
                          <h3 className="text-lg font-bold hover:text-primary transition-colors">{request.listing.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">مطلوب: {request.listing.wantsInExchange}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-md">
                        {new Date(request.createdAt).toLocaleDateString('ar-JO')}
                      </span>
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-3 mb-4 flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm italic text-foreground/80">
                        {request.message ? `"${request.message}"` : 'بدون رسالة إضافية'}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                      <Link href={`/profile/${otherUser.id}`}>
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors pr-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUser.avatarUrl || ''} />
                            <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{otherUser.name}</span>
                            <span className="text-xs text-muted-foreground">{isReceived ? 'مقدم الطلب' : 'صاحب الإعلان'}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Actions based on status and type */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {isReceived && request.status === SwapRequestStatus.pending && (
                          <>
                            <Button 
                              variant="outline" 
                              className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction('reject', request.id)}
                              disabled={rejectMutation.isPending}
                            >
                              رفض
                            </Button>
                            <Button 
                              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleAction('accept', request.id)}
                              disabled={acceptMutation.isPending}
                            >
                              قبول
                            </Button>
                          </>
                        )}
                        
                        {request.status === SwapRequestStatus.accepted && (
                          <>
                            <Button 
                              variant="outline"
                              className="flex-1 sm:flex-none"
                              onClick={() => setLocation(`/conversations/${request.id}`)}
                            >
                              المحادثة
                            </Button>
                            {isReceived && (
                              <Button 
                                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleAction('complete', request.id)}
                                disabled={completeMutation.isPending}
                              >
                                تأكيد التبديل
                              </Button>
                            )}
                          </>
                        )}

                        {request.status === SwapRequestStatus.completed && (
                          <Button 
                            variant="outline"
                            className="flex-1 sm:flex-none gap-2 text-accent border-accent hover:bg-accent/10"
                          >
                            تقييم التبديل
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold">طلبات التبديل</h1>
      </div>

      <Tabs defaultValue="received" dir="rtl">
        <TabsList className="w-full sm:w-auto mb-6 bg-muted/50 p-1 grid grid-cols-2 max-w-sm">
          <TabsTrigger value="received" className="py-2">طلبات مستلمة</TabsTrigger>
          <TabsTrigger value="sent" className="py-2">طلبات مرسلة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="mt-0">
          <RequestList requests={receivedRequests || []} type="received" isLoading={isLoadingReceived} />
        </TabsContent>
        
        <TabsContent value="sent" className="mt-0">
          <RequestList requests={sentRequests || []} type="sent" isLoading={isLoadingSent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
