import { useGetAdminStats, useGetAdminUsers, getGetAdminUsersQueryKey, useBanUser, useGetAdminListings, getGetAdminListingsQueryKey, useAdminDeleteListing, useGetAdminReports, getGetAdminReportsQueryKey, useResolveReport } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Package, ArrowRightLeft, AlertTriangle, Trash2, Ban, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStats();
  
  // States
  const [userSearch, setUserSearch] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);

  // Queries
  const adminUsersParams = { q: userSearch, page: usersPage };
  const adminListingsParams = { page: listingsPage };
  const adminReportsParams = { status: 'pending' as const };

  const { data: usersData, isLoading: isUsersLoading } = useGetAdminUsers(
    adminUsersParams,
    { query: { queryKey: getGetAdminUsersQueryKey(adminUsersParams) } }
  );

  const { data: listingsData, isLoading: isListingsLoading } = useGetAdminListings(
    adminListingsParams,
    { query: { queryKey: getGetAdminListingsQueryKey(adminListingsParams) } }
  );

  const { data: reportsData, isLoading: isReportsLoading } = useGetAdminReports(
    adminReportsParams,
    { query: { queryKey: getGetAdminReportsQueryKey(adminReportsParams) } }
  );

  // Mutations
  const banUserMutation = useBanUser();
  const deleteListingMutation = useAdminDeleteListing();
  const resolveReportMutation = useResolveReport();

  const handleBanToggle = (userId: number, currentStatus: boolean) => {
    banUserMutation.mutate(
      { id: userId, data: { banned: !currentStatus } },
      {
        onSuccess: () => {
          toast.success(currentStatus ? 'تم رفع الحظر عن المستخدم' : 'تم حظر المستخدم بنجاح');
          queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        }
      }
    );
  };

  const handleDeleteListing = (listingId: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
      deleteListingMutation.mutate(
        { id: listingId },
        {
          onSuccess: () => {
            toast.success('تم حذف الإعلان بنجاح');
            queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
          }
        }
      );
    }
  };

  const handleResolveReport = (reportId: number, status: 'resolved' | 'dismissed') => {
    resolveReportMutation.mutate(
      { id: reportId, data: { status } },
      {
        onSuccess: () => {
          toast.success('تم معالجة البلاغ بنجاح');
          queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              <h3 className="text-2xl font-bold">{isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalUsers}</h3>
              <p className="text-xs text-emerald-500 mt-1">+{stats?.newUsersThisWeek} هذا الأسبوع</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
              <h3 className="text-2xl font-bold">{isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalListings}</h3>
              <p className="text-xs text-emerald-500 mt-1">+{stats?.newListingsThisWeek} هذا الأسبوع</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عمليات التبديل</p>
              <h3 className="text-2xl font-bold">{isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalSwaps}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">البلاغات المعلقة</p>
              <h3 className="text-2xl font-bold">{isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalReports}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" dir="rtl">
        <TabsList className="mb-6 bg-muted/50 p-1 flex w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="users" className="flex-1 md:px-8 gap-2">
            <Users className="h-4 w-4 hidden sm:block" /> المستخدمين
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex-1 md:px-8 gap-2">
            <Package className="h-4 w-4 hidden sm:block" /> الإعلانات
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 md:px-8 gap-2 relative">
            <AlertTriangle className="h-4 w-4 hidden sm:block" /> البلاغات
            {stats?.totalReports ? <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-destructive"></span> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>إدارة المستخدمين</CardTitle>
              <div className="relative w-64">
                <Input 
                  placeholder="ابحث بالاسم أو الإيميل..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pr-9"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="rounded-md border">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">المدينة</TableHead>
                        <TableHead className="text-right">تاريخ الانضمام</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatarUrl || ''} />
                                <AvatarFallback>{u.name.substring(0,2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{u.city}</TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString('ar-JO')}</TableCell>
                          <TableCell>
                            {u.isBanned ? (
                              <Badge variant="destructive">محظور</Badge>
                            ) : u.isAdmin ? (
                              <Badge className="bg-primary/20 text-primary">مشرف</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none">نشط</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-left">
                            {!u.isAdmin && (
                              <Button 
                                variant={u.isBanned ? "outline" : "destructive"} 
                                size="sm" 
                                className="h-8 text-xs gap-1"
                                onClick={() => handleBanToggle(u.id, u.isBanned)}
                                disabled={banUserMutation.isPending}
                              >
                                <Ban className="h-3 w-3" />
                                {u.isBanned ? 'رفع الحظر' : 'حظر'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الإعلانات</CardTitle>
            </CardHeader>
            <CardContent>
              {isListingsLoading ? (
                <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="rounded-md border">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الإعلان</TableHead>
                        <TableHead className="text-right">المعلن</TableHead>
                        <TableHead className="text-right">القسم</TableHead>
                        <TableHead className="text-right">تاريخ النشر</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listingsData?.listings.map(listing => (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {listing.images?.[0] ? (
                                <img src={listing.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium max-w-[200px] truncate">{listing.title}</p>
                                {listing.isFeatured && <Badge variant="secondary" className="text-[10px] h-4 mt-1 bg-accent/20 text-accent">مميز</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{listing.owner.name}</TableCell>
                          <TableCell><Badge variant="outline">{listing.category.name}</Badge></TableCell>
                          <TableCell>{new Date(listing.createdAt).toLocaleDateString('ar-JO')}</TableCell>
                          <TableCell className="text-left">
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 text-xs gap-1"
                              onClick={() => handleDeleteListing(listing.id)}
                              disabled={deleteListingMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>مراجعة البلاغات</CardTitle>
            </CardHeader>
            <CardContent>
              {isReportsLoading ? (
                <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : reportsData?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">لا توجد بلاغات معلقة</div>
              ) : (
                <div className="space-y-4">
                  {reportsData?.map(report => (
                    <Card key={report.id} className="border-border bg-muted/20">
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">بلاغ عن {report.targetType === 'user' ? 'مستخدم' : 'إعلان'}</Badge>
                            <span className="text-sm text-muted-foreground">من: {report.reporter.name}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{new Date(report.createdAt).toLocaleDateString('ar-JO')}</span>
                          </div>
                          <p className="font-medium text-foreground">{report.reason}</p>
                          <p className="text-sm text-muted-foreground mt-1">ID الهدف: {report.targetId}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            className="flex-1 sm:flex-none"
                            onClick={() => handleResolveReport(report.id, 'dismissed')}
                            disabled={resolveReportMutation.isPending}
                          >
                            تجاهل
                          </Button>
                          <Button 
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleResolveReport(report.id, 'resolved')}
                            disabled={resolveReportMutation.isPending}
                          >
                            إجراء
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
