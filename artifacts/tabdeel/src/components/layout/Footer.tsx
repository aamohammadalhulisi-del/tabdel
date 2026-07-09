import { Link } from 'wouter';
import { ArrowRightLeft, Heart, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t mt-12 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-primary">تبديل</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            منصة تبديل هي مساحتك الآمنة في الأردن لمبادلة الأغراض التي لم تعد بحاجة إليها بأشياء أخرى مفيدة. دعنا نحد من الهدر ونبني مجتمعاً متعاوناً.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">روابط سريعة</h3>
          <ul className="space-y-2">
            <li><Link href="/listings" className="text-sm text-muted-foreground hover:text-primary transition-colors">تصفح الإعلانات</Link></li>
            <li><Link href="/listings/new" className="text-sm text-muted-foreground hover:text-primary transition-colors">أضف إعلان</Link></li>
            <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">تسجيل الدخول</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">المساعدة</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">كيف يعمل الموقع؟</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">شروط الاستخدام</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">سياسة الخصوصية</a></li>
            <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">اتصل بنا</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">تابعنا</h3>
          <div className="flex items-center gap-4">
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} منصة تبديل. جميع الحقوق محفوظة.
        </p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          صنع بـ <Heart className="h-4 w-4 text-destructive" /> في الأردن
        </p>
      </div>
    </footer>
  );
}