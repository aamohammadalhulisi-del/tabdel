import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetListings, useGetCategories, GetListingsCondition, getGetListingsQueryKey } from '@workspace/api-client-react';
import { ListingCard } from '@/components/shared/ListingCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';

export default function Browse() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState<string>(searchParams.get('condition') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [page, setPage] = useState(1);

  const { data: categories } = useGetCategories();
  
  const listingParams = {
    q: q || undefined,
    category: category !== 'all' ? category : undefined,
    condition: condition !== 'all' ? condition as GetListingsCondition : undefined,
    city: city || undefined,
    page,
    limit: 12,
  };
  const { data, isLoading } = useGetListings(
    listingParams,
    { query: { queryKey: getGetListingsQueryKey(listingParams) } }
  );

  const clearFilters = () => {
    setQ('');
    setCategory('all');
    setCondition('all');
    setCity('');
    setPage(1);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>البحث</Label>
        <div className="relative">
          <Input 
            placeholder="ابحث عن..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            className="pr-9"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>القسم</Label>
        <Select value={category} onValueChange={setCategory} dir="rtl">
          <SelectTrigger>
            <SelectValue placeholder="اختر القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {categories?.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>الحالة</Label>
        <Select value={condition} onValueChange={setCondition} dir="rtl">
          <SelectTrigger>
            <SelectValue placeholder="حالة الغرض" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="good">جيد</SelectItem>
            <SelectItem value="used">مستخدم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>المدينة</Label>
        <Input 
          placeholder="مثال: عمان، إربد" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
        />
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 ml-2" /> مسح الفلاتر
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية النتائج
            </h2>
            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">الإعلانات</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> فلاتر
              </Button>
            </SheetTrigger>
            <SheetContent side="right" dir="rtl" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>تصفية النتائج</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="hidden md:block mb-6">
            <h1 className="text-2xl font-bold">تصفح الإعلانات</h1>
            <p className="text-muted-foreground mt-1">ابحث عن ما تحتاجه وبادله بما لا تحتاجه</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : data?.listings.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <div className="flex justify-center mb-4">
                <Search className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">جرب تغيير كلمات البحث أو الفلاتر</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              
              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <Button 
                    variant="outline" 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    السابق
                  </Button>
                  <div className="flex items-center px-4 font-medium">
                    {page} من {data.totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={page === data.totalPages}
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
