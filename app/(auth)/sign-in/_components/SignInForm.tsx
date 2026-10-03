"use client";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/_components/ui/form";
import { Input } from "@/_components/ui/input";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import CustomButton from "@/_components/Shared/CustomButton";
import { getPostSignInPath } from "@/lib/auth/callback-url";
import { cn } from "@/lib/utils";

// Only checks both fields are filled in. Password length rules belong to
// registration; repeating them here would just reject a valid password early
const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

// Same height, border and focus ring as the home search and filter controls
const inputStyle =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-sm transition-colors placeholder:text-slate-400 hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 aria-[invalid=true]:border-red-400";

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInFormValues) {
    setFormError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok && !result.error) {
        toast.success("Signed in successfully");
        // Replace so Back doesn't land on a sign-in page that bounces away.
        // The button stays busy until the next page takes over
        router.replace(getPostSignInPath());
        router.refresh();
        return;
      }

      // next-auth reports a wrong email or password as CredentialsSignin;
      // any other error is the server failing, not the person
      if (result?.error === "CredentialsSignin") {
        setFormError("The email or password is incorrect. Check both and try again.");
        form.setFocus("password", { shouldSelect: true });
      } else {
        setFormError("We couldn't sign you in just now. Please try again in a few minutes.");
      }
    } catch {
      setFormError("We couldn't sign you in just now. Please try again in a few minutes.");
    }

    setIsLoading(false);
  }

  const updateCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState("CapsLock"));
  };

  return (
    <Form {...form}>
      {/* noValidate so a malformed email gets the same inline message as
          every other mistake instead of the browser's own popup */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className='space-y-5'>
        {formError && (
          <div
            role='alert'
            className='flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
            <AlertCircle
              className='mt-0.5 size-4 shrink-0 text-red-600'
              aria-hidden='true'
            />
            <p>{formError}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-medium text-slate-700'>
                Email address
              </FormLabel>
              <FormControl>
                {/* "username" rather than "email" so password managers pair
                    this field with the password below */}
                <Input
                  type='email'
                  autoComplete='username'
                  autoCapitalize='none'
                  spellCheck={false}
                  placeholder='you@company.com'
                  className={inputStyle}
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-medium text-slate-700'>
                Password
              </FormLabel>
              <div className='relative'>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete='current-password'
                    className={cn(inputStyle, "pr-11")}
                    {...field}
                    onKeyDown={updateCapsLock}
                    onKeyUp={updateCapsLock}
                    onBlur={() => {
                      field.onBlur();
                      setIsCapsLockOn(false);
                    }}
                  />
                </FormControl>
                <button
                  type='button'
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label='Show password'
                  aria-pressed={showPassword}
                  className='absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'>
                  {showPassword ? (
                    <EyeOff
                      className='size-4'
                      aria-hidden='true'
                    />
                  ) : (
                    <Eye
                      className='size-4'
                      aria-hidden='true'
                    />
                  )}
                </button>
              </div>
              {/* Passwords are case sensitive, so warn before a wasted attempt */}
              {isCapsLockOn && (
                <p className='text-xs font-medium text-amber-700'>
                  Caps Lock is on
                </p>
              )}
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        <CustomButton
          btnName='Sign in'
          variant='primary'
          type='submit'
          fullWidth={true}
          RightIcon={ArrowRight}
          isLoading={isLoading}
          className='h-10 rounded-lg text-sm'
        />
      </form>
    </Form>
  );
};

export default SignInForm;
