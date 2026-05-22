'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';

import { setCredentials } from '@/store/slices/authSlice';
import { getUserFromAccessToken } from '@/lib/auth';

export default function OAuthSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const user = getUserFromAccessToken(accessToken);

    if (!accessToken || !refreshToken || !user) {
      toast.error('OAuth sign-in failed. Please try again.');
      router.replace('/login?error=oauth_failed');
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch(setCredentials({ user }));
    toast.success('Signed in with Google');
    router.replace('/dashboard');
  }, [dispatch, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#dff7ef,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff_48%,#fff7ed)] p-4 text-slate-950">
      <section className="rounded-2xl border border-white/70 bg-white/70 p-8 text-center shadow-2xl shadow-slate-200/70 backdrop-blur-xl">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="text-2xl font-black">Finishing sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Taking you to your dashboard.</p>
      </section>
    </main>
  );
}
