'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { CheckCircle, XCircle, Loader2, Users, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;
  const [accepted, setAccepted] = useState(false);

  const detailsQuery = trpc.workspace.getInviteDetails.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const acceptMutation = trpc.workspace.acceptInvite.useMutation({
    onSuccess: (data) => {
      setAccepted(true);
      toast.success(data.message);
      // Redirect to dashboard after 2s
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const invite = detailsQuery.data;
  const isError = detailsQuery.isError;
  const isLoading = detailsQuery.isLoading;

  function handleAccept() {
    acceptMutation.mutate({ token });
  }

  // Not logged in guard
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // Store the invite URL so we can redirect back after login
      localStorage.setItem('postLoginRedirect', `/invite/${token}`);
      router.push('/login');
    }
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="mx-auto max-w-md border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto size-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Invalid Invitation
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This invitation link is invalid or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (invite.isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="mx-auto max-w-md border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto size-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold text-slate-950">
            Invitation Expired
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This invitation has expired. Please ask the workspace admin to send a new one.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (accepted || invite.isAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="mx-auto max-w-md border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto size-12 text-slate-950" />
          <h1 className="mt-4 text-xl font-bold text-slate-950">
            You&apos;re In!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You&apos;ve joined <span className="font-semibold text-slate-950">{invite.workspaceName}</span>.
            Redirecting to your dashboard…
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
          >
            Go Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto max-w-md border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center border-2 border-slate-200 bg-slate-50">
          <Users className="size-8 text-slate-950" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-950">
          Workspace Invitation
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-950">{invite.inviterEmail}</span>{' '}
          has invited you to join
        </p>

        <div className="mt-3 border-2 border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-950">{invite.workspaceName}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Role: {invite.role}
          </p>
        </div>

        <button
          onClick={handleAccept}
          disabled={acceptMutation.isLoading}
          className="mt-6 w-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
        >
          {acceptMutation.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Joining…
            </span>
          ) : (
            'Accept Invitation'
          )}
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-3 w-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:border-slate-300"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
