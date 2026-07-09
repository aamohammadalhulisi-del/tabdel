import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const [errorData, setErrorData] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorData(null);
    loginMutation.mutate({ data }, {
      onSuccess: (response) => {
        queryClient.setQueryData(getGetMeQueryKey(), response.user);
        setLocation('/');
      },
      onError: () => {
        setErrorData('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ArrowRightLeft className="h-7 w-7" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">أهلاً بك في منصة تبديل</CardTitle>
          <CardDescription>قم بتسجيل الدخول للبدء في مبادلة أغراضك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="text-right"
                dir="ltr"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                dir="ltr"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            {errorData && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {errorData}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              حساب جديد
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
