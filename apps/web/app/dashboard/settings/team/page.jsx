'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { trpc } from '@/utils/trpc';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  Edit3,
  Crown,
  Mail,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  OWNER: { label: 'Owner', icon: Crown, color: 'bg-slate-950 text-white' },
  ADMIN: { label: 'Admin', icon: ShieldCheck, color: 'bg-slate-200 text-slate-950' },
  EDITOR: { label: 'Editor', icon: Edit3, color: 'bg-slate-100 text-slate-700' },
  VIEWER: { label: 'Viewer', icon: Eye, color: 'bg-slate-50 text-slate-500' },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.VIEWER;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${config.color}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function RoleDropdown({ currentRole, onSelect, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const roles = ['ADMIN', 'EDITOR', 'VIEWER'];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1 border-2 border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-950 shadow-sm transition-all hover:border-slate-300 disabled:opacity-40"
      >
        {currentRole}
        <ChevronDown className="size-3" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-32 border-2 border-slate-200 bg-white shadow-sm">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => {
                onSelect(role);
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 ${
                role === currentRole ? 'bg-slate-950 text-white hover:bg-slate-900' : 'text-slate-950'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamSettingsPage() {
  const { activeWorkspaceId, workspaces } = useSelector((s) => s.workspace);
  const activeWorkspace = workspaces.find((w) => w.workspaceId === activeWorkspaceId);
  const myRole = activeWorkspace?.role;
  const isAdminOrOwner = myRole === 'OWNER' || myRole === 'ADMIN';
  const isOwner = myRole === 'OWNER';

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);

  // ─── Subscription check ───────────────────────────────────────────
  const subscriptionQuery = trpc.billing.getSubscription.useQuery();
  const userPlanTier = subscriptionQuery.data?.plan?.tier;
  const isBusinessPlan = userPlanTier === 'business';

  // ─── tRPC Queries & Mutations ─────────────────────────────────────

  const membersQuery = trpc.workspace.getMembers.useQuery(
    { workspaceId: activeWorkspaceId },
    { enabled: !!activeWorkspaceId }
  );

  const pendingInvitesQuery = trpc.workspace.getPendingInvites.useQuery(
    { workspaceId: activeWorkspaceId },
    { enabled: !!activeWorkspaceId && isAdminOrOwner }
  );

  const inviteMutation = trpc.workspace.inviteMember.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setInviteEmail('');
      setInviteRole('VIEWER');
      pendingInvitesQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.workspace.removeMember.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      membersQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      membersQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // ─── Handlers ─────────────────────────────────────────────────────

  function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspaceId) return;
    inviteMutation.mutate({
      workspaceId: activeWorkspaceId,
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  }

  function handleRemove(memberId) {
    if (!confirm('Remove this member from the workspace?')) return;
    removeMutation.mutate({
      workspaceId: activeWorkspaceId,
      memberId,
    });
  }

  function handleRoleChange(memberId, newRole) {
    updateRoleMutation.mutate({
      workspaceId: activeWorkspaceId,
      memberId,
      role: newRole,
    });
  }

  // ─── Guards ───────────────────────────────────────────────────────

  // No workspace selected AND not on Business plan → show upgrade
  if (!activeWorkspaceId && !subscriptionQuery.isLoading && !isBusinessPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="mx-auto max-w-lg border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center border-2 border-slate-200 bg-slate-50">
            <Users className="size-8 text-slate-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-950">
            Workspaces & Team Collaboration
          </h2>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Create workspaces, invite team members, and collaborate on forms together.
            This feature is available exclusively on the <span className="font-bold text-slate-950">Business plan</span>.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-block bg-slate-950 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Upgrade to Business →
          </a>
        </div>
      </div>
    );
  }

  if (!activeWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="size-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-950">No workspace selected</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select or create a workspace using the switcher in the header.
        </p>
      </div>
    );
  }

  const members = membersQuery.data || [];
  const pendingInvites = (pendingInvitesQuery.data || []).filter((inv) => !inv.acceptedAt);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950">
          Team
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage members and invitations for{' '}
          <span className="font-semibold text-slate-950">
            {activeWorkspace?.workspaceName}
          </span>
        </p>
      </div>

      {/* ─── Invite Section (OWNER/ADMIN only) ────────────────────── */}
      {isAdminOrOwner && (
        <div className="border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="size-5 text-slate-950" />
            <h3 className="text-base font-bold text-slate-950 uppercase tracking-wide">
              Invite Member
            </h3>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-0">
              <div className="flex items-center border-2 border-r-0 border-slate-200 bg-slate-50 px-3 py-2.5">
                <Mail className="size-4 text-slate-400" />
              </div>
              <input
                id="invite-email-input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="w-full border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none"
              />
            </div>

            {/* Role selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsInviteRoleOpen(!isInviteRoleOpen)}
                className="flex items-center gap-2 border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:border-slate-300 w-full sm:w-auto justify-between"
              >
                <Shield className="size-4 text-slate-500" />
                {inviteRole}
                <ChevronDown className={`size-4 text-slate-400 transition-transform ${isInviteRoleOpen ? 'rotate-180' : ''}`} />
              </button>
              {isInviteRoleOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-full border-2 border-slate-200 bg-white shadow-sm sm:w-36">
                  {['ADMIN', 'EDITOR', 'VIEWER'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setInviteRole(role);
                        setIsInviteRoleOpen(false);
                      }}
                      className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-50 ${
                        role === inviteRole ? 'bg-slate-950 text-white hover:bg-slate-900' : 'text-slate-950'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={inviteMutation.isLoading || !inviteEmail.trim()}
              className="flex items-center justify-center gap-2 bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {inviteMutation.isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Send Invite
            </button>
          </form>
        </div>
      )}

      {/* ─── Members Table ────────────────────────────────────────── */}
      <div className="border-2 border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b-2 border-slate-200 px-6 py-4">
          <Users className="size-5 text-slate-950" />
          <h3 className="text-base font-bold text-slate-950 uppercase tracking-wide">
            Members
          </h3>
          <span className="ml-auto border-2 border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 tabular-nums">
            {members.length}
          </span>
        </div>

        {membersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-slate-400" />
          </div>
        ) : members.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            No members found
          </div>
        ) : (
          <div className="divide-y-2 divide-slate-200">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex size-10 items-center justify-center border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-950">
                    {member.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {member.email}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 font-mono">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />

                  {/* Role change dropdown (OWNER only, not for OWNER members) */}
                  {isOwner && member.role !== 'OWNER' && (
                    <RoleDropdown
                      currentRole={member.role}
                      onSelect={(newRole) => handleRoleChange(member.id, newRole)}
                      disabled={updateRoleMutation.isLoading}
                    />
                  )}

                  {/* Remove button (OWNER/ADMIN, not for OWNER members) */}
                  {isAdminOrOwner && member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={removeMutation.isLoading}
                      className="border-2 border-slate-200 p-2 text-slate-400 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      title="Remove member"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Pending Invites ──────────────────────────────────────── */}
      {isAdminOrOwner && pendingInvites.length > 0 && (
        <div className="border-2 border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b-2 border-slate-200 px-6 py-4">
            <Mail className="size-5 text-slate-950" />
            <h3 className="text-base font-bold text-slate-950 uppercase tracking-wide">
              Pending Invitations
            </h3>
            <span className="ml-auto border-2 border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-500 tabular-nums">
              {pendingInvites.length}
            </span>
          </div>

          <div className="divide-y-2 divide-slate-200">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-400">
                    ?
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {invite.email}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 font-mono">
                      Invited {new Date(invite.createdAt).toLocaleDateString()}
                      {new Date() > new Date(invite.expiresAt) && (
                        <span className="ml-2 font-bold text-red-500">EXPIRED</span>
                      )}
                    </p>
                  </div>
                </div>

                <RoleBadge role={invite.role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
