import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useCreateListing, useGetCategories, useUploadImage } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const createListingSchema = z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يحتوي على الأقل على 3 أحرف' }),
  description: z.string().min(10, { message: 'الوصف يجب أن يحتوي على الأقل على 10 أحرف' }),
  condition: z.enum(['new', 'good', 'used'], { required_error: 'يرجى اختيار الحالة' }),
  wantsInExchange: z.string().min(3, { message: 'يرجى تحديد ما ترغب به في المقابل' }),
  categoryId: z.coerce.number().min(1, { message: 'يرجى اختيار القسم' }),
  city: z.string().min(2, { message: 'المدينة مطلوبة' }),
});

type CreateListingFormValues = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const [, setLocation] = useLocation();
  const [images, setImages] = useState<{ url: string; file?: File; isUploading?: boolean }[]>([]);
  
const { data: categoriesResponse } = useGetCategories();

const categories = Array.isArray(categoriesResponse)
  ? categoriesResponse
  : (categoriesResponse as any)?.categories || [];
  const createListingMutation = useCreateListing();
  const uploadImageMutation = useUploadImage();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
  });

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (images.length + files.length > 5) {
      toast.error('يمكنك رفع 5 صور كحد أقصى');
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isUploading: true
    }));

    setImages(prev => [...prev, ...newImages]);

    // Upload each file
    for (const img of newImages) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(img.file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        // Use correct upload mutation (assuming it returns { url: string })
        uploadImageMutation.mutate(
          { data: { base64, filename: img.file.name } },
          {
            onSuccess: (res) => {
              setImages(prev =>
  prev.map(p =>
    p.file === img.file
      ? {
          ...p,
          url: (res as any).url || (res as any).secure_url || p.url,
          isUploading: false
        }
      : p
  )
);
            },
            onError: () => {
              toast.error('فشل رفع الصورة');
              setImages(prev => prev.filter(p => p.file !== img.file));
            }
          }
        );
      } catch (err) {
        setImages(prev => prev.filter(p => p.file !== img.file));
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const onSubmit = (data: CreateListingFormValues) => {
    if (images.some(img => img.isUploading)) {
      toast.error('يرجى الانتظار حتى اكتمال رفع الصور');
      return;
    }

    const imageUrls = images.map(img => img.url).filter(url => !url.startsWith('blob:'));

    createListingMutation.mutate(
      { 
        data: {
          ...data,
          images: imageUrls
        } 
      },
      {
        onSuccess: (listing) => {
          toast.success('تم إضافة الإعلان بنجاح');
          setLocation(`/listings/${listing.id}`);
        },
        onError: () => {
          toast.error('فشل إضافة الإعلان، يرجى المحاولة مرة أخرى');
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">أضف إعلان جديد</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>الصور</CardTitle>
            <CardDescription>أضف صور واضحة للغرض الذي ترغب في مبادلته (الحد الأقصى 5 صور)</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input 
                id="image-upload" 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium text-lg">اسحب وأفلت الصور هنا</p>
                  <p className="text-muted-foreground text-sm">أو انقر لاختيار ملفات</p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    {img.isUploading && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      className="absolute top-1 right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الغرض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input id="title" placeholder="ماذا تريد أن تبدل؟" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>القسم</Label>
                <Select onValueChange={(val) => setValue('categoryId', parseInt(val))} dir="rtl">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                   {Array.isArray(categories) && categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select onValueChange={(val: any) => setValue('condition', val)} dir="rtl">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="good">جيد</SelectItem>
                    <SelectItem value="used">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea 
                id="description" 
                placeholder="اكتب وصفاً دقيقاً لحالة الغرض، مواصفاته، وميزاته..." 
                className="min-h-[120px]"
                {...register('description')} 
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="wantsInExchange">مطلوب للبدل</Label>
                <Input id="wantsInExchange" placeholder="ماذا تريد بالمقابل؟ (مثال: أيفون 12، أثاث مكتبي)" {...register('wantsInExchange')} />
                {errors.wantsInExchange && <p className="text-sm text-destructive">{errors.wantsInExchange.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" placeholder="مكان تواجد الغرض (مثال: عمان، الزرقاء)" {...register('city')} />
                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setLocation('/')}>
            إلغاء
          </Button>
          <Button type="submit" className="px-8" disabled={createListingMutation.isPending || uploadImageMutation.isPending}>
            {createListingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'نشر الإعلان'}
          </Button>
        </div>
      </form>
    </div>
  );
}
