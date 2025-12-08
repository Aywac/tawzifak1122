'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { UserAvatar } from '@/components/user-avatar';
import { uploadToCloudinary } from '@/lib/cloudinary';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  photoURL: z.string().optional().nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'كلمة المرور الحالية مطلوبة.' }),
    newPassword: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirmPassword'],
  });

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { user: authUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const profileFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      photoURL: user?.photoURL || null,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsProcessingImage(true);
      
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = async () => {
          const size = Math.min(img.width, img.height);
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessingImage(false);
            return;
          }

          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
          const croppedData = canvas.toDataURL('image/png');

          try {
             const secureUrl = await uploadToCloudinary(croppedData);
             
             profileForm.setValue('photoURL', secureUrl, { shouldValidate: true, shouldDirty: true });
             
             toast({
              title: "تم تحميل الصورة بنجاح",
              description: "تم قص الصورة تلقائياً للحفاظ على التناسب.",
            });
          } catch (error) {
             toast({
                variant: "destructive",
                title: "خطأ",
                description: "فشل رفع الصورة.",
             });
          } finally {
             setIsProcessingImage(false);
          }
        };
      };
      reader.onerror = () => {
        setIsProcessingImage(false);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل الصورة",
          description: "حدث خطأ أثناء معالجة الصورة."
        });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!authUser) return;
    setIsSubmitting(true);
    try {
      const updatedData = {
        name: values.name,
        phone: values.phone || '',
        photoURL: values.photoURL,
      };
      await updateUserProfile(authUser.uid, updatedData);
      toast({ title: 'تم حفظ التغييرات بنجاح' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ البيانات.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if (!authUser || !authUser.email) return;
    setIsPasswordSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(authUser.email, values.currentPassword);
      await reauthenticateWithCredential(authUser, credential);
      await updatePassword(authUser, values.newPassword);
      toast({ title: 'تم تغيير كلمة المرور بنجاح' });
      passwordForm.reset();
    } catch (error: any) {
      let errorMessage = 'فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'كلمة المرور الحالية غير صحيحة.';
      }
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: errorMessage,
      });
    } finally {
      setIsPasswordSubmitting(false);
      passwordFormRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  }

  const photoURL = profileForm.watch('photoURL');

  return (
    <div className="space-y-8">
      <Form {...profileForm}>
        <form ref={profileFormRef} onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
          <FormField
            control={profileForm.control}
            name="photoURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الصورة الشخصية (اختياري)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <UserAvatar
                        name={userData?.name}
                        color={userData?.avatarColor}
                        photoURL={photoURL}
                        className="h-20 w-20 text-3xl"
                      />
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="active:scale-95 transition-transform"
                        onClick={() => document.getElementById('picture')?.click()}
                        disabled={isProcessingImage}
                      >
                        {isProcessingImage ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري المعالجة...
                          </>
                        ) : (
                          'تغيير الصورة'
                        )}
                      </Button>
                      {photoURL && !isProcessingImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 active:scale-95 transition-transform"
                          onClick={() => profileForm.setValue('photoURL', null, { shouldDirty: true })}
                        >
                          إزالة الصورة
                        </Button>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم الكامل</FormLabel>
                <FormControl>
                  <Input placeholder="اسمك الكامل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="+xxxxxxxxxx" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full active:scale-95 transition-transform"
            disabled={isSubmitting || !profileForm.formState.isDirty}
          >
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </form>
      </Form>
    </div>
  );
    }
