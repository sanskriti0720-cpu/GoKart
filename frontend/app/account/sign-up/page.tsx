import type { Metadata } from 'next';
import { AuthExperience } from '@/components/AuthExperience';

export const metadata: Metadata = { title: 'Create an account | GoKart', description: 'Create a GoKart account to save favorites and track orders.' };

export default function SignUpPage() {
  return <AuthExperience mode="register" />;
}
