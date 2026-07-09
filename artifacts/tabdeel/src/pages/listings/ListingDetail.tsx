import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { 
  useGetListing, 
  getGetListingQueryKey,
  useCreateSwapRequest, 
  useCreateReport, 
  ReportInputTargetType 
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, AlertTriangle, ArrowRightLeft, Star, Share2, Heart, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useEmblaCarousel from 'embla-carousel-react';

const conditionMap: Record<string, { label: string; color: string }> = {
  new: { label: 'جديد', color: 'bg-emerald-500/10 text-emerald-600' },
  good: { label: 'جيد', color: 'bg-blue-500/10 text-blue-600' },
  used: { label: 'مستخدم', color: 'bg-amber-500/10 text-amber-600' },
};

export default function ListingDetail() {
  const [, params] = useRoute('/listings/:id');
  const id = parseInt(params?.id || '0');
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [emblaRef] = useEmblaCarousel({ direction: 'rtl' });
  
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { data: listing, isLoading } = useGetListing(id, {
    query: { enabled: !!id, queryKey: getGetListingQueryKey(id) }
  });

  const createSwapMutation = useCreateSwapRequest();
  const createReportMutation = useCreateReport();

  const handleSwapRequest = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    createSwapMutation.mutate(
      { data: { listingId: id, message: swapMessage } },
      {
        onSuccess: () => {
          toast.success('تم إرسال طلب التبديل بنجاح');
          setIsSwapDialogOpen(false);
          setSwapMessage('');
        },
        onError: () => {
          toast.error('حدث خطأ أثناء إرسال الطلب');
        }
      }
    );
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    createReportMutation.mutate(
      {
        data: {
          targetType: ReportInputTargetType.listing,
          targetId: id,
          reason: reportReason
        }
      },
      {
        onSuccess: () => {
          toast.success('تم إرسال البلاغ بنجاح وسيقوم فريقنا بمراجعته');
          setIsReportDialogOpen(false);
          setReportReason('');
        },
        onError: () => {
          toast.error('حدث خطأ أثناء إرسال البلاغ');
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-[400px] bg-muted rounded-xl"></div>
          <div className="h-8 w-1/2 bg-muted rounded"></div>
          <div className="h-4 w-1/4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">الإعلان غير موجود</h1>
        <Button onClick={() => setLocation('/listings')}>العودة للإعلانات</Button>
      </div>
    );
  }

  const isOwner = user?.id === listing.owner.id;
  const condition = conditionMap[listing.condition] || conditionMap.used;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            {/* Image Carousel */}
            {listing.images && listing.images.length > 0 ? (
              <div className="relative">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex touch-pan-y">
                    {listing.images.map((img, idx) => (
                      <div key={idx} className="relative flex-[0_0_100%] min-w-0 aspect-[4/3] sm:aspect-[16/9] bg-muted">
                        <img src={img} alt={`${listing.title} - ${idx + 1}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, idx) => (
                      <div key={idx} className="h-2 w-2 rounded-full bg-primary/50 shadow-sm" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">لا توجد صور</span>
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {listing.category.name}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">{listing.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{listing.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(listing.createdAt).toLocaleDateString('ar-JO')}</span>
                </div>
                <Badge className={condition.color} variant="secondary">
                  {condition.label}
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  الوصف
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & User Info */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="p-6 space-y-6 pt-8">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">مطلوب للبدل</h3>
                <div className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg">
                  <ArrowRightLeft className="h-6 w-6 text-primary shrink-0" />
                  <p className="font-semibold text-lg">{listing.wantsInExchange}</p>
                </div>
              </div>

              {!isOwner && (
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold gap-2" 
                  onClick={() => isAuthenticated ? setIsSwapDialogOpen(true) : setLocation('/login')}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                  طلب تبديل
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">صاحب الإعلان</h3>
              <div className="flex items-center gap-4">
                <Link href={`/profile/${listing.owner.id}`}>
                  <Avatar className="h-16 w-16 border-2 border-primary/20 cursor-pointer">
                    <AvatarImage src={listing.owner.avatarUrl || ''} />
                    <AvatarFallback className="text-xl bg-primary/5 text-primary">
                      {listing.owner.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${listing.owner.id}`}>
                    <h4 className="font-semibold text-lg hover:text-primary cursor-pointer">{listing.owner.name}</h4>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium text-foreground">{listing.owner.rating.toFixed(1)}</span>
                      <span>({listing.owner.ratingCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.owner.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!isOwner && (
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <Button variant="outline" className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setIsReportDialogOpen(true)}>
                    <AlertTriangle className="h-4 w-4" />
                    الإبلاغ عن الإعلان
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Swap Request Dialog */}
      <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إرسال طلب تبديل</DialogTitle>
            <DialogDescription>
              هل لديك <strong>{listing?.wantsInExchange}</strong> أو ما يعادله لتبديله مع <strong>{listing?.title}</strong>؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">رسالة إضافية (اختياري)</label>
              <Textarea 
                placeholder="أخبر صاحب الإعلان عن الغرض الذي تود التبديل به وحالته..."
                value={swapMessage}
                onChange={(e) => setSwapMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSwapDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSwapRequest} disabled={createSwapMutation.isPending} className="bg-primary">
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>الإبلاغ عن الإعلان</DialogTitle>
            <DialogDescription>
              يرجى توضيح سبب الإبلاغ عن هذا الإعلان. سيتم مراجعة البلاغ من قبل الإدارة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">سبب الإبلاغ</label>
              <Textarea 
                placeholder="اكتب سبب الإبلاغ هنا..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleReport} disabled={createReportMutation.isPending || !reportReason.trim()} variant="destructive">
              إرسال البلاغ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
