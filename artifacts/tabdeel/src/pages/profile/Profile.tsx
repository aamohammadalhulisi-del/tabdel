import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  useGetUser, 
  getGetUserQueryKey,
  useGetMe, 
  useGetUserListings, 
  getGetUserListingsQueryKey,
  useGetUserRatings,
  getGetUserRatingsQueryKey,
  useUpdateUser
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/shared/ListingCard';
import { MapPin, Star, Calendar, MessageSquare, Settings, Edit2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Profile() {
  const [, params] = useRoute('/profile/:id');
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  
  const isOwnProfile = !params?.id;
  const targetId = isOwnProfile ? currentUser?.id : parseInt(params?.id || '0');

  const { data: profileUser, isLoading: isUserLoading } = useGetUser(targetId as number, {
    query: { enabled: !!targetId, queryKey: getGetUserQueryKey(targetId as number) }
  });

  const { data: listings, isLoading: isListingsLoading } = useGetUserListings(targetId as number, {
    query: { enabled: !!targetId, queryKey: getGetUserListingsQueryKey(targetId as number) }
  });

  const { data: ratingsResponse, isLoading: isRatingsLoading } = useGetUserRatings(targetId as number, {
    query: { enabled: !!targetId, queryKey: getGetUserRatingsQueryKey(targetId as number) }
  });

  const updateUserMutation = useUpdateUser();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', city: '', phone: '' });

  const openEditModal = () => {
    if (profileUser) {
      setEditForm({
        name: profileUser.name,
        city: profileUser.city,
        phone: currentUser?.phone || ''
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateProfile = () => {
    if (!targetId) return;
    updateUserMutation.mutate(
      { id: targetId, data: editForm },
      {
        onSuccess: () => {
          toast.success('تم تحديث الملف الشخصي بنجاح');
          setIsEditModalOpen(false);
          // Assuming cache invalidation or automatic refetch is handled, if not:
          // queryClient.invalidateQueries(getGetUserQueryKey(targetId));
        },
        onError: () => {
          toast.error('حدث خطأ أثناء تحديث الملف الشخصي');
        }
      }
    );
  };

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-muted rounded-xl"></div>
          <div className="h-8 w-1/4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">المستخدم غير موجود</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <Card className="mb-8 border-border shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent opacity-90"></div>
        <CardContent className="relative px-6 pb-6 pt-0 sm:px-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-12 sm:-mt-16 mb-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profileUser.avatarUrl || ''} />
              <AvatarFallback className="text-3xl sm:text-5xl bg-primary/10 text-primary font-bold">
                {profileUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{profileUser.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profileUser.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>انضم في {new Date(profileUser.createdAt).toLocaleDateString('ar-JO')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{profileUser.rating.toFixed(1)}</span>
                  <span>({profileUser.ratingCount} تقييم)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={openEditModal}>
                    <Edit2 className="h-4 w-4" />
                    تعديل الحساب
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setLocation('/settings')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button className="flex-1 sm:flex-none gap-2 w-full">
                  <MessageSquare className="h-4 w-4" />
                  تواصل
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
            <div className="text-center space-y-1">
              <span className="text-2xl font-bold">{profileUser.listingsCount}</span>
              <p className="text-sm text-muted-foreground">إعلان</p>
            </div>
            <div className="text-center space-y-1 border-r border-border">
              <span className="text-2xl font-bold">{ratingsResponse?.totalCount || 0}</span>
              <p className="text-sm text-muted-foreground">مبادلة ناجحة</p>
            </div>
            <div className="text-center space-y-1 border-r border-border">
              <span className="text-2xl font-bold">{profileUser.rating.toFixed(1)}</span>
              <p className="text-sm text-muted-foreground">التقييم العام</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="listings" dir="rtl">
        <TabsList className="w-full sm:w-auto mb-6 bg-muted/50 p-1">
          <TabsTrigger value="listings" className="flex-1 sm:flex-none px-8">الإعلانات</TabsTrigger>
          <TabsTrigger value="ratings" className="flex-1 sm:flex-none px-8">التقييمات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings" className="mt-0">
          {isListingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-xl"></div>)}
            </div>
          ) : listings?.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed">
              <h3 className="text-lg font-semibold mb-2">لا توجد إعلانات</h3>
              <p className="text-muted-foreground">هذا المستخدم لم يقم بإضافة أي إعلانات بعد.</p>
              {isOwnProfile && (
                <Button className="mt-4" onClick={() => setLocation('/listings/new')}>أضف أول إعلان</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listings?.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ratings" className="mt-0 space-y-4">
          {isRatingsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>)}
            </div>
          ) : ratingsResponse?.ratings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed">
              <h3 className="text-lg font-semibold mb-2">لا توجد تقييمات</h3>
              <p className="text-muted-foreground">لم يتلق هذا المستخدم أي تقييمات حتى الآن.</p>
            </div>
          ) : (
            ratingsResponse?.ratings.map(rating => (
              <Card key={rating.id} className="border-border">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={rating.rater.avatarUrl || ''} />
                    <AvatarFallback>{rating.rater.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{rating.rater.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(rating.createdAt).toLocaleDateString('ar-JO')}
                      </span>
                    </div>
                    <div className="flex text-accent text-sm">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={star <= rating.stars ? "fill-current" : "opacity-30"} />
                      ))}
                    </div>
                    {rating.comment && (
                      <p className="text-sm mt-2 text-foreground/80">{rating.comment}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الملف الشخصي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input 
                id="name" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Input 
                id="city" 
                value={editForm.city} 
                onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input 
                id="phone" 
                value={editForm.phone} 
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                dir="ltr"
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleUpdateProfile} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
