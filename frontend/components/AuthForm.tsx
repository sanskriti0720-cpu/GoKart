'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { useCustomer } from '@/context/CustomerContext';

const authSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Use at least 8 characters.').max(72, 'Password is too long.'),
  confirmPassword: z.string().optional(),
  acceptedTerms: z.boolean().optional(),
}).superRefine((values, context) => {
  if (!values.name) context.addIssue({ code: 'custom', path: ['name'], message: 'Enter your name.' });
  if (values.password !== values.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' });
  if (!values.acceptedTerms) context.addIssue({ code: 'custom', path: ['acceptedTerms'], message: 'Please accept the terms to continue.' });
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(72),
});

type AuthValues = z.infer<typeof authSchema>;
function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35">{children}</span>;
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register: registerAccount } = useCustomer();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === 'register';
  const { register: field, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<AuthValues>({
    resolver: zodResolver(isRegister ? authSchema : loginSchema) as Resolver<AuthValues>,
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', acceptedTerms: false },
  });
  const password = useWatch({ control, name: 'password' }) || '';
  const strength = password.length === 0 ? 0 : Math.min(3, Number(password.length >= 8) + Number(/[A-Z]/.test(password) && /[a-z]/.test(password)) + Number(/[\d\W]/.test(password)));
  const strengthLabel = ['', 'Getting started', 'Looking good', 'Strong password'][strength];

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      if (isRegister) {
        await registerAccount({ name: values.name || '', email: values.email, password: values.password });
      } else {
        await login({ email: values.email, password: values.password });
      }
      router.replace('/account');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Your request could not be completed. Please try again.');
    }
  });

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      {isRegister && <div>
        <label className="mb-1.5 block text-xs font-bold text-ink/75" htmlFor="auth-name">Full name</label>
        <div className="relative"><FieldIcon><UserRound size={17} /></FieldIcon><input autoComplete="name" className="w-full rounded-2xl border border-line bg-paper/65 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-ink/30 focus:border-violet focus:bg-white focus:shadow-[0_0_0_4px_rgba(121,87,255,.08)]" id="auth-name" placeholder="What should we call you?" {...field('name')} /></div>
        {errors.name && <p className="mt-1.5 text-[11px] font-medium text-coral">{errors.name.message}</p>}
      </div>}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-ink/75" htmlFor="auth-email">Email address</label>
        <div className="relative"><FieldIcon><Mail size={17} /></FieldIcon><input autoComplete="email" className="w-full rounded-2xl border border-line bg-paper/65 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-ink/30 focus:border-violet focus:bg-white focus:shadow-[0_0_0_4px_rgba(121,87,255,.08)]" id="auth-email" placeholder="you@example.com" type="email" {...field('email')} /></div>
        {errors.email && <p className="mt-1.5 text-[11px] font-medium text-coral">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-ink/75" htmlFor="auth-password">Password</label>
        <div className="relative"><FieldIcon><LockKeyhole size={17} /></FieldIcon><input autoComplete={isRegister ? 'new-password' : 'current-password'} className="w-full rounded-2xl border border-line bg-paper/65 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-ink/30 focus:border-violet focus:bg-white focus:shadow-[0_0_0_4px_rgba(121,87,255,.08)]" id="auth-password" placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'} type={showPassword ? 'text' : 'password'} {...field('password')} /><button aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink/40 transition hover:bg-violet/10 hover:text-violet" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        {errors.password && <p className="mt-1.5 text-[11px] font-medium text-coral">{errors.password.message}</p>}
        {isRegister && <div className="mt-2.5"><div aria-label={`Password strength: ${strengthLabel || 'empty'}`} className="flex gap-1"><span className={`h-1 flex-1 rounded-full ${strength >= 1 ? 'bg-coral' : 'bg-line'}`} /><span className={`h-1 flex-1 rounded-full ${strength >= 2 ? 'bg-violet' : 'bg-line'}`} /><span className={`h-1 flex-1 rounded-full ${strength >= 3 ? 'bg-lime' : 'bg-line'}`} /></div><p className="mt-1 text-[10px] text-ink/45">{strengthLabel || 'Use a mix of letters and numbers.'}</p></div>}
      </div>
      {isRegister && <div>
        <label className="mb-1.5 block text-xs font-bold text-ink/75" htmlFor="auth-confirm-password">Confirm password</label>
        <div className="relative"><FieldIcon><LockKeyhole size={17} /></FieldIcon><input autoComplete="new-password" className="w-full rounded-2xl border border-line bg-paper/65 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-ink/30 focus:border-violet focus:bg-white focus:shadow-[0_0_0_4px_rgba(121,87,255,.08)]" id="auth-confirm-password" placeholder="Enter it one more time" type={showPassword ? 'text' : 'password'} {...field('confirmPassword')} /></div>
        {errors.confirmPassword && <p className="mt-1.5 text-[11px] font-medium text-coral">{errors.confirmPassword.message}</p>}
      </div>}
      {!isRegister && <div className="flex items-center justify-between gap-3 text-xs"><span className="inline-flex items-center gap-2 text-ink/55"><span className="size-1.5 rounded-full bg-lime" /> Secure, private sign in</span><span className="text-ink/35">Sessions last 7 days</span></div>}
      {isRegister && <div><label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-5 text-ink/60"><input className="mt-1 accent-violet" type="checkbox" {...field('acceptedTerms')} />I agree to GoKart’s terms and understand my account details are used to manage orders.</label>{errors.acceptedTerms && <p className="mt-1 text-[11px] font-medium text-coral">{errors.acceptedTerms.message}</p>}</div>}
      <AnimatePresence>{serverError && <motion.p animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-coral/15 bg-coral/5 px-4 py-3 text-sm text-[#b23c48]" exit={{ opacity: 0, y: -4 }} initial={{ opacity: 0, y: -4 }} role="alert">{serverError}</motion.p>}</AnimatePresence>
      <button className="gk-button group flex w-full items-center justify-center gap-2 rounded-full bg-violet px-5 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(121,87,255,.2)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'One moment…' : isRegister ? 'Create my account' : 'Sign in to GoKart'} {!isSubmitting && <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />}</button>
      <p className="pt-1 text-center text-xs text-ink/55">{isRegister ? 'Already part of the crew?' : 'New to GoKart?'}{' '}
        <Link className="font-extrabold text-violet transition hover:text-ink" href={isRegister ? '/account/sign-in' : '/account/sign-up'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </form>
  );
}
