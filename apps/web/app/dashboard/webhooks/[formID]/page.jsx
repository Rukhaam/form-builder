'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import Link from 'next/link';
import { ArrowLeft, Webhook, Save, Trash2, Key, Link2, Activity, Play, CheckCircle2, XCircle, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 shadow-inner">
        <Lock className="size-6 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800">Webhooks Locked</h3>
      <p className="mt-2 max-w-sm text-center text-sm font-medium text-slate-500">
        Upgrade to Pro or Business to unlock real-time webhook deliveries to your CRM or custom endpoints.
      </p>
      <Link
        href="/pricing"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.98]"
      >
        View Plans
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export default function WebhookSettingsPage() {
  const params = useParams();
  const formId = Array.isArray(params.formID) ? params.formID[0] : params.formID;

  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [isActive, setIsActive] = useState(true);

  const utils = trpc.useContext();

  const { data, isLoading, isError } = trpc.webhook.get.useQuery(
    { formId },
    { enabled: !!formId, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (data?.webhook) {
      setUrl(data.webhook.url || '');
      setSecret(data.webhook.secret || '');
      setIsActive(data.webhook.isActive);
    }
  }, [data]);

  const upsertMutation = trpc.webhook.upsert.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.webhook.get.invalidate({ formId });
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const deleteMutation = trpc.webhook.delete.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setUrl('');
      setSecret('');
      setIsActive(true);
      utils.webhook.get.invalidate({ formId });
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const testMutation = trpc.webhook.test.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.webhook.get.invalidate({ formId });
    },
    onError: (err) => {
      toast.error(err.message);
      utils.webhook.get.invalidate({ formId });
    }
  });

  const handleSave = () => {
    if (!url.startsWith('https://')) {
      toast.error('Webhook URL must use HTTPS');
      return;
    }
    upsertMutation.mutate({ formId, url, secret, isActive });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this webhook?')) {
      deleteMutation.mutate({ formId });
    }
  };

  const handleTest = () => {
    testMutation.mutate({ formId });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 px-4 pt-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-center mt-20 text-red-500 font-medium">Failed to load webhook configuration.</div>;
  }

  const { formTitle, webhook, isLocked } = data;
  const isSaving = upsertMutation.isLoading;
  const isTesting = testMutation.isLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-4 pb-12 pt-8">
      {/* HEADER */}
      <div>
        <Link href={`/dashboard/editor/${formId}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to editor
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
            <Webhook className="size-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Webhooks</h2>
            <p className="text-sm font-medium text-slate-500">For: <span className="text-slate-700">{formTitle}</span></p>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Main Settings Card */}
        <Card className="rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg">Endpoint Configuration</CardTitle>
            <CardDescription>
              We'll send a POST request with the response JSON to this URL every time your form is submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Link2 className="size-4 text-slate-400" />
                Payload URL
              </label>
              <Input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-api.com/webhooks/formbuilder"
                className="font-mono text-sm bg-slate-50"
              />
            </div>

            {/* Secret Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Key className="size-4 text-slate-400" />
                Secret (Optional)
              </label>
              <Input 
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                type="password"
                placeholder="Used to generate HMAC SHA256 signature"
                className="font-mono text-sm bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                If provided, we will include an <code className="bg-slate-100 px-1 rounded">X-FormBuilder-Signature</code> header with the HMAC hex digest.
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="activeToggle" className="text-sm font-medium text-slate-700 cursor-pointer">
                Enable webhook deliveries
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !url}
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6"
                >
                  <Save className="size-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Webhook'}
                </Button>
                {webhook && (
                  <Button 
                    onClick={handleTest} 
                    disabled={isTesting || isSaving}
                    variant="outline" 
                    className="rounded-xl border-slate-200"
                  >
                    <Play className="size-4 mr-2 text-slate-500" />
                    {isTesting ? 'Testing...' : 'Test Delivery'}
                  </Button>
                )}
              </div>
              
              {webhook && (
                <Button 
                  onClick={handleDelete}
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

          </CardContent>
        </Card>

        {isLocked && <LockedOverlay />}
      </div>

      {/* Delivery Status Card */}
      {webhook && !isLocked && (
        <Card className="rounded-2xl border border-slate-200/60 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="size-4" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {webhook.lastTriggeredAt ? (
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Last Delivery Attempt</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(webhook.lastTriggeredAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase">HTTP</span>
                  <span className={`text-sm font-bold ${
                    webhook.lastStatus >= 200 && webhook.lastStatus < 300 ? 'text-emerald-600' :
                    webhook.lastStatus === 0 ? 'text-slate-400' : 'text-red-600'
                  }`}>
                    {webhook.lastStatus === 0 ? 'ERR' : webhook.lastStatus}
                  </span>
                  {webhook.lastStatus >= 200 && webhook.lastStatus < 300 ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-red-500" />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                No deliveries attempted yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
