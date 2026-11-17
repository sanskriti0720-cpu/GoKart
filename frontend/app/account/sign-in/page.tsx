import type { Metadata } from 'next';
import { AuthExperience } from '@/components/AuthExperience';

export const metadata: Metadata = { title: 'Sign in | GoKart', description: 'Sign in to your GoKart account and get back to your saved finds.' };

export default function SignInPage() {
  return <AuthExperience mode="login" />;
}
