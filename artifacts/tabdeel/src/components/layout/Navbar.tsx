import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Menu,
  PlusCircle,
  User as UserIcon,
  Settings,
  LogOut,
  ArrowRightLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  useGetNotifications,
  getGetNotificationsQueryKey
} from '@workspace/api-client-react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { useState } from 'react';


export function Navbar() {

  const { user, isAuthenticated, logout } = useAuth();

  const [location, setLocation] = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const { data: notifications } = useGetNotifications({
    query: {
      enabled: isAuthenticated,
      queryKey: getGetNotificationsQueryKey(),
    }
  });


  // حماية من اختلاف شكل بيانات API
  const notificationsList: any[] = Array.isArray(notifications)
  ? notifications
  : (notifications as any)?.notifications || [];
  const unreadCount = notificationsList.filter(
    (n:any) => !n.isRead
  ).length;



  const NavLinks = () => (
    <>
      <Link
        href="/"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          location === '/' ? 'text-primary' : 'text-foreground/80'
        }`}
      >
        الرئيسية
      </Link>


      <Link
        href="/listings"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          location === '/listings' ? 'text-primary' : 'text-foreground/80'
        }`}
      >
        الإعلانات
      </Link>


      {isAuthenticated && (
        <>
          <Link
            href="/swap-requests"
            className="text-sm font-medium text-foreground/80 hover:text-primary"
          >
            طلباتي
          </Link>


          <Link
            href="/conversations"
            className="text-sm font-medium text-foreground/80 hover:text-primary"
          >
            محادثاتي
          </Link>
        </>
      )}
    </>
  );



  return (

    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">

      <div className="container mx-auto flex h-16 items-center justify-between px-4">


        <div className="flex items-center gap-6">


          <Link href="/" className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">

              <ArrowRightLeft className="h-5 w-5"/>

            </div>


            <span className="text-2xl font-bold text-primary">
              تبديل
            </span>


          </Link>



          <nav className="hidden md:flex items-center gap-6">

            <NavLinks />

          </nav>


        </div>




        <div className="flex items-center gap-3">


        {isAuthenticated ? (

          <>


          <Link href="/listings/new">

            <Button
              size="sm"
              className="gap-2 bg-accent text-accent-foreground"
            >

              <PlusCircle className="h-4 w-4"/>

              أضف إعلان

            </Button>

          </Link>



          <Link href="/notifications">

            <Button variant="ghost" size="icon" className="relative">

              <Bell className="h-5 w-5"/>


              {unreadCount > 0 && (

                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"/>

              )}


            </Button>


          </Link>




          <DropdownMenu>


          <DropdownMenuTrigger asChild>


            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full"
            >

              <Avatar>

                <AvatarImage src={user?.avatarUrl || ''}/>


                <AvatarFallback>

                  {user?.name?.slice(0,2)}

                </AvatarFallback>


              </Avatar>


            </Button>


          </DropdownMenuTrigger>



          <DropdownMenuContent align="end">


            <DropdownMenuLabel>

              {user?.name}

              <br/>

              <span className="text-xs text-muted-foreground">

                {user?.email}

              </span>


            </DropdownMenuLabel>


            <DropdownMenuSeparator/>


            <DropdownMenuItem
              onClick={()=>setLocation('/profile')}
            >

              <UserIcon className="mr-2 h-4 w-4"/>

              الملف الشخصي

            </DropdownMenuItem>



            {user?.isAdmin && (

              <DropdownMenuItem
                onClick={()=>setLocation('/admin')}
              >

                <Settings className="mr-2 h-4 w-4"/>

                الإدارة

              </DropdownMenuItem>

            )}



            <DropdownMenuSeparator/>



            <DropdownMenuItem
              onClick={logout}
              className="text-red-500"
            >

              <LogOut className="mr-2 h-4 w-4"/>

              تسجيل الخروج


            </DropdownMenuItem>



          </DropdownMenuContent>


          </DropdownMenu>


          </>


        ) : (

          <>

          <Button
            variant="ghost"
            onClick={()=>setLocation('/login')}
          >
            دخول
          </Button>


          <Button
            onClick={()=>setLocation('/register')}
          >
            حساب جديد
          </Button>


          </>

        )}





        <Sheet
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
        >

          <SheetTrigger asChild>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >

              <Menu/>

            </Button>


          </SheetTrigger>



          <SheetContent side="right">


            <nav className="flex flex-col gap-5 mt-10">

              <Link href="/">
                الرئيسية
              </Link>


              <Link href="/listings">
                الإعلانات
              </Link>


              {isAuthenticated && (

                <>
                  <Link href="/swap-requests">
                    طلباتي
                  </Link>


                  <Link href="/conversations">
                    محادثاتي
                  </Link>
                </>

              )}


            </nav>


          </SheetContent>


        </Sheet>



        </div>


      </div>


    </header>

  );
}