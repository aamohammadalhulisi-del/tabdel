import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Bell, Menu, PlusCircle, Search, User as UserIcon, Settings, LogOut, Package, MessageCircle, ArrowRightLeft } from 'lucide-react';
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
import { useGetNotifications, getGetNotificationsQueryKey } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
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

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const NavLinks = () => (
    <>
      <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}>
        الرئيسية
      </Link>
      <Link href="/listings" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/listings' ? 'text-primary' : 'text-foreground/80'}`}>
        الإعلانات
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/swap-requests" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/swap-requests' ? 'text-primary' : 'text-foreground/80'}`}>
            طلباتي
          </Link>
          <Link href="/conversations" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/conversations' ? 'text-primary' : 'text-foreground/80'}`}>
            محادثاتي
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-primary">تبديل</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/listings/new" className="hidden sm:flex">
                <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <PlusCircle className="h-4 w-4" />
                  أضف إعلان
                </Button>
              </Link>
              
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive"></span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user?.avatarUrl || ''} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')} className="cursor-pointer gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/listings/new')} className="cursor-pointer gap-2 sm:hidden">
                    <PlusCircle className="h-4 w-4" />
                    <span>أضف إعلان</span>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem onClick={() => setLocation('/admin')} className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4" />
                      <span>لوحة الإدارة</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setLocation('/login')}>
                دخول
              </Button>
              <Button onClick={() => setLocation('/register')} className="bg-primary">
                حساب جديد
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]" dir="rtl">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold text-primary">تبديل</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>الرئيسية</Link>
                  <Link href="/listings" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>الإعلانات</Link>
                  {isAuthenticated && (
                    <>
                      <Link href="/swap-requests" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>طلباتي</Link>
                      <Link href="/conversations" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>محادثاتي</Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
