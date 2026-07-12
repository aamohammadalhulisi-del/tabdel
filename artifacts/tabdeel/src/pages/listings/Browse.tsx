import { useState } from 'react';
import { useGetListings, useGetCategories, GetListingsCondition, getGetListingsQueryKey } from '@workspace/api-client-react';
import { ListingCard } from '@/components/shared/ListingCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Browse() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState<string>(searchParams.get('condition') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [page, setPage] = useState(1);


  const { data: categoriesResponse } = useGetCategories();

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : (categoriesResponse as any)?.categories ?? [];


  const listingParams = {
    q: q || undefined,
    category: category !== 'all' ? category : undefined,
    condition: condition !== 'all'
      ? condition as GetListingsCondition
      : undefined,
    city: city || undefined,
    page,
    limit: 12,
  };


  const { data, isLoading } = useGetListings(
    listingParams,
    {
      query: {
        queryKey: getGetListingsQueryKey(listingParams)
      }
    }
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
          />

          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" />
        </div>
      </div>


      <div className="space-y-2">

        <Label>القسم</Label>

        <Select
          value={category}
          onValueChange={setCategory}
          dir="rtl"
        >

          <SelectTrigger>
            <SelectValue placeholder="اختر القسم" />
          </SelectTrigger>


          <SelectContent>

            <SelectItem value="all">
              الكل
            </SelectItem>


            {categories.map((c:any)=>(
              <SelectItem
                key={c.id}
                value={c.id.toString()}
              >
                {c.name}
              </SelectItem>
            ))}


          </SelectContent>

        </Select>

      </div>



      <div className="space-y-2">

        <Label>الحالة</Label>

        <Select
          value={condition}
          onValueChange={setCondition}
          dir="rtl"
        >

          <SelectTrigger>
            <SelectValue placeholder="حالة الغرض" />
          </SelectTrigger>


          <SelectContent>

            <SelectItem value="all">
              الكل
            </SelectItem>

            <SelectItem value="new">
              جديد
            </SelectItem>

            <SelectItem value="good">
              جيد
            </SelectItem>

            <SelectItem value="used">
              مستخدم
            </SelectItem>

          </SelectContent>

        </Select>

      </div>



      <div className="space-y-2">

        <Label>المدينة</Label>

        <Input
          placeholder="مثال: عمان، إربد"
          value={city}
          onChange={(e)=>setCity(e.target.value)}
        />

      </div>



      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        <X className="h-4 w-4 ml-2"/>
        مسح الفلاتر
      </Button>


    </div>
  );



  return (

    <div className="container mx-auto px-4 py-8">


      <div className="flex flex-col md:flex-row gap-8">


        <aside className="hidden md:block w-64 shrink-0">

          <div className="border rounded-xl p-6">

            <h2 className="text-lg font-bold mb-6 flex gap-2">

              <Filter className="h-5 w-5"/>

              تصفية النتائج

            </h2>


            <FilterContent/>

          </div>

        </aside>



        <div className="flex-1">


          <div className="mb-6">

            <h1 className="text-2xl font-bold">
              تصفح الإعلانات
            </h1>

            <p className="text-muted-foreground">
              ابحث عن ما تحتاجه
            </p>

          </div>



          {isLoading ? (

            <p>
              تحميل...
            </p>


          ) : data?.listings?.length === 0 ? (

            <div className="text-center py-20">

              <Search className="mx-auto h-12 w-12"/>

              <h3 className="text-lg font-bold mt-4">
                لا توجد نتائج
              </h3>

            </div>


          ) : (


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">


              {data?.listings?.map((listing:any)=>(

                <ListingCard
                  key={listing.id}
                  listing={listing}
                />

              ))}


            </div>


          )}



        </div>


      </div>


    </div>

  );
}