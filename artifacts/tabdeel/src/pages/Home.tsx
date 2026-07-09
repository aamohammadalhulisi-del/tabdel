import { Link, useLocation } from 'wouter';
import { useGetCategories, useGetFeaturedListings, useGetListings, getGetListingsQueryKey } from '@workspace/api-client-react';
import { Search, ArrowRight, Loader2, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListingCard } from '@/components/shared/ListingCard';
import { useState } from 'react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();
  const { data: featuredListings, isLoading: isFeaturedLoading } = useGetFeaturedListings();
  const recentParams = { limit: 8 };
  const { data: recentListingsResponse, isLoading: isRecentLoading } = useGetListings(
    recentParams,
    { query: { queryKey: getGetListingsQueryKey(recentParams) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/listings?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden text-primary-foreground py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            لا تشتري.. <span className="text-accent">بدّل</span>!
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-10 text-primary-foreground/90 leading-relaxed">
            منصة تبديل هي المكان الأفضل في الأردن لمبادلة الأغراض التي لا تحتاجها بأشياء أخرى مفيدة لك. وفر مالك وساهم في تقليل الهدر.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center shadow-xl rounded-full bg-background p-1.5 focus-within:ring-2 focus-within:ring-accent transition-shadow">
            <Input
              type="text"
              placeholder="عن ماذا تبحث؟ (مثال: بلايستيشن، لابتوب، كتب...)"
              className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 shadow-none text-base h-12 px-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-full shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </form>
          
          <div className="mt-8 flex items-center gap-4 text-sm font-medium">
            <span>شائع الآن:</span>
            <div className="flex gap-2">
              <Link href="/listings?q=ايفون" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full transition-colors">ايفون</Link>
              <Link href="/listings?q=اثاث" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full transition-colors">أثاث</Link>
              <Link href="/listings?q=كتب" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3 py-1 rounded-full transition-colors">كتب</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              تصفح الأقسام
            </h2>
          </div>
          
          {isCategoriesLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 w-32 shrink-0 bg-muted animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 snap-x no-scrollbar">
              {categories?.map(category => (
                <Link key={category.id} href={`/listings?category=${category.id}`}>
                  <div className="group snap-center shrink-0 w-32 flex flex-col items-center justify-center p-4 bg-background border border-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <i className={`fa-solid fa-${category.icon || 'box'} text-xl`}></i>
                    </div>
                    <span className="text-sm font-semibold text-center">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              إعلانات مميزة
            </h2>
            <Link href="/listings?featured=true" className="text-primary font-medium flex items-center gap-1 hover:underline">
              عرض الكل <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : featuredListings?.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground">لا توجد إعلانات مميزة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredListings?.slice(0, 4).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-muted/10 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              أحدث الإضافات
            </h2>
            <Link href="/listings" className="text-primary font-medium flex items-center gap-1 hover:underline">
              تصفح الكل <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {isRecentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : recentListingsResponse?.listings.length === 0 ? (
             <div className="text-center py-12 bg-background rounded-xl border border-dashed">
              <p className="text-muted-foreground">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentListingsResponse?.listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-accent-foreground text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">عندك غرض ما بتحتاجه؟</h2>
          <p className="text-lg mb-8 opacity-90">
            أضف إعلانك الآن مجاناً وبدّل أغراضك مع آلاف المستخدمين في الأردن.
          </p>
          <Link href="/listings/new">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg rounded-full">
              أضف إعلانك الآن
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
