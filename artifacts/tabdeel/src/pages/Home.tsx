import AdBanner from "@/components/ads/AdBanner";
import { Link, useLocation } from 'wouter';
import {
  useGetCategories,
  useGetFeaturedListings,
  useGetListings,
  getGetListingsQueryKey
} from '@workspace/api-client-react';

import { Search, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListingCard } from '@/components/shared/ListingCard';
import { useState } from 'react';


export default function Home() {

  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');


  // Categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading
  } = useGetCategories();


 const categories: any[] = Array.isArray(categoriesData)
  ? categoriesData
  : (categoriesData as any)?.categories ?? [];
  // Featured
  const {
    data: featuredData,
    isLoading: isFeaturedLoading
  } = useGetFeaturedListings();


 const featuredListings: any[] = Array.isArray(featuredData)
  ? featuredData
  : (featuredData as any)?.listings ?? [];
  // Recent
  const recentParams = {
    limit: 8
  };


  const {
    data: recentData,
    isLoading: isRecentLoading
  } = useGetListings(
    recentParams,
    {
      query: {
        queryKey: getGetListingsQueryKey(recentParams)
      }
    }
  );


  const recentListings: any[] =
  Array.isArray(recentData)
    ? recentData
    : (recentData as any)?.listings ?? [];


  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();

    if(searchQuery.trim()){

      setLocation(
        `/listings?q=${encodeURIComponent(searchQuery)}`
      );

    }

  };




  return (

    <div className="flex flex-col min-h-screen">


      {/* Hero */}

      <section className="bg-primary text-primary-foreground py-20">

        <div className="container mx-auto px-4 text-center">


          <h1 className="text-5xl font-bold mb-6">

            لا تشتري.. <span className="text-accent">بدّل</span>

          </h1>


          <p className="mb-8 text-lg">

            منصة تبديل للأغراض في الأردن

          </p>



          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto flex bg-white rounded-full p-2"
          >

            <Input

              value={searchQuery}

              onChange={(e)=>
                setSearchQuery(e.target.value)
              }

              placeholder="ابحث عن شيء..."

              className="text-black"

            />


            <Button type="submit">

              <Search />

            </Button>


          </form>


        </div>

      </section>





      {/* Categories */}

      <section className="py-12">

        <div className="container mx-auto px-4">


          <h2 className="text-2xl font-bold mb-8 flex gap-2">

            <Sparkles />

            الأقسام

          </h2>



          {
            isCategoriesLoading ? (

              <p>تحميل...</p>

            ) : (


              <div className="flex gap-4 overflow-x-auto">


                {
                  categories.map((category:any)=>(


                    <Link

                      key={category.id}

                      href={`/listings?category=${category.id}`}

                    >


                      <div className="w-32 p-5 rounded-xl border text-center">


                        <div className="mb-3">

                          📦

                        </div>


                        <span>

                          {category.name}

                        </span>


                      </div>


                    </Link>


                  ))

                }


              </div>


            )
          }


        </div>


      </section>






      {/* Featured */}

      <section className="py-12 bg-muted/20">


        <div className="container mx-auto px-4">


          <h2 className="text-2xl font-bold mb-8 flex gap-2">

            <TrendingUp />

            إعلانات مميزة

          </h2>




          {
            isFeaturedLoading ? (

              <p>تحميل...</p>


            ) : (


              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">


                {
                  featuredListings
                    .slice(0,4)
                    .map((listing:any)=>(


                      <ListingCard

                        key={listing.id}

                        listing={listing}

                      />


                    ))

                }


              </div>


            )
          }



        </div>


      </section>






      {/* Recent */}

      <section className="py-12">


        <div className="container mx-auto px-4">


          <h2 className="text-2xl font-bold mb-8 flex gap-2">

            <Clock />

            أحدث الإضافات

          </h2>



          {
            isRecentLoading ? (

              <p>تحميل...</p>


            ) : (


              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">


                {
                  recentListings.map((listing:any)=>(


                    <ListingCard

                      key={listing.id}

                      listing={listing}

                    />


                  ))

                }


              </div>


            )
          }



        </div>


           </section>


            {/* Advertisement */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <AdBanner />
        </div>
      </section>




      {/* Categories */}
      <section className="py-20 bg-accent text-center">


        <h2 className="text-3xl font-bold mb-5">

          عندك غرض ما تحتاجه؟

        </h2>


        <Link href="/listings/new">

          <Button>

            أضف إعلانك

          </Button>

        </Link>


      </section>



    </div>

  );

}