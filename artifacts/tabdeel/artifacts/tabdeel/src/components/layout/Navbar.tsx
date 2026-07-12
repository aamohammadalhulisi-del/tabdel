import { Link } from "wouter";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetNotifications } from "@workspace/api-client-react";


export function Navbar() {

  const { data: notificationsData } = useGetNotifications();


  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.notifications ?? [];


  const unreadCount = notifications.filter(
    (n:any) => !n.isRead
  ).length;



  return (

    <nav className="border-b bg-background">

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">


        <Link href="/" className="text-2xl font-bold text-primary">
          بدّل
        </Link>



        <div className="flex items-center gap-4">


          <Link href="/listings">
            الإعلانات
          </Link>


          <Link href="/listings/new">
            أضف إعلان
          </Link>



          <Link href="/notifications" className="relative">

            <Bell className="w-5 h-5"/>


            {unreadCount > 0 && (

              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">

                {unreadCount}

              </span>

            )}

          </Link>



          <Button variant="ghost">

            <Menu />

          </Button>


        </div>


      </div>


    </nav>

  );

}