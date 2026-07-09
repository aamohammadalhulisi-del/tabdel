import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يحتوي على الأقل على حرفين' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تحتوي على الأقل على 6 أحرف' }),
  phone: z.string().min(9, { message: 'رقم الهاتف غير صالح' }),
  city: z.string().min(2, { message: 'المدينة مطلوبة' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();
  const [errorData, setErrorData] = useState<string | null>(null);

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormValues) => {
    setErrorData(null);
    registerMutation.mutate({ data }, {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetMeQueryKey(), response.user);
        setLocation('/');
      },
      onError: () => {
        setErrorData('فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدم بالفعل.');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ArrowRightLeft className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلى منصة تبديل وابدأ في تبادل الأغراض</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" placeholder="محمد أحمد" {...formRegister('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...formRegister('email')}
                dir="ltr"
                className="text-right"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                {...formRegister('password')}
                dir="ltr"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  placeholder="0790000000"
                  {...formRegister('phone')}
                  dir="ltr"
                  className="text-right"
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" placeholder="عمان" {...formRegister('city')} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
            </div>

            {errorData && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {errorData}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'إنشاء حساب'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
