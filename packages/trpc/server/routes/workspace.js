import "../utils/loadEnv.js";
import { router, protectedProcedure, workspaceProcedure } from "../trpc.js";
import {
  db,
  workspaces,
  workspaceMembers,
  workspaceInvites,
  forms,
  users,
  subscriptions,
} from "@repo/database";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";
import { sendWorkspaceInviteEmail } from "../utils/email.js";
import { getPlan, DEFAULT_PLAN_ID } from "../utils/plans.js";

// ── Helpers ─────────────────────────────────────────────────────────────

const INVITE_EXPIRY_DAYS = 7;

function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

function slugifyTitle(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return slug || "untitled-form";
}

async function createUniqueSlug(title) {
  const baseSlug = slugifyTitle(title);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${baseSlug}-${suffix}`;
    const [existing] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1);
    if (!existing) return slug;
  }
  return `${baseSlug}-${Date.now().toString(36)}`;
}

/** Only OWNER and ADMIN may manage members */
function requireAdminOrOwner(role) {
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only workspace owners and admins can perform this action",
    });
  }
}

/**
 * Ensures the user is on a Business-tier plan.
 * Throws FORBIDDEN with an upgrade prompt if not.
 */
async function requireBusinessPlan(userId) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const plan = getPlan(sub?.planId ?? DEFAULT_PLAN_ID);

  if (plan.tier !== "business") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Workspaces & Team Collaboration is a Business plan feature. Upgrade to Business to unlock it.",
    });
  }
}

// ── Router ──────────────────────────────────────────────────────────────

export const workspaceRouter = router({
  // ─── Workspace CRUD (authenticated, no workspace context) ───────────

  /** Create a new workspace and make the caller the OWNER (Business plan only) */
  createWorkspace: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      await requireBusinessPlan(ctx.user.id);

      const [workspace] = await db
        .insert(workspaces)
        .values({ name: input.name })
        .returning();

      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: ctx.user.id,
        role: "OWNER",
      });

      return { workspace };
    }),

  /** List all workspaces the calling user belongs to */
  getMyWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        workspaceName: workspaces.name,
        workspaceCreatedAt: workspaces.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, ctx.user.id))
      .orderBy(desc(workspaces.createdAt));

    return memberships;
  }),

  // ─── Member Management (workspace-scoped) ───────────────────────────

  /** List all members of a workspace */
  getMembers: workspaceProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx }) => {
      const members = await db
        .select({
          id: workspaceMembers.id,
          userId: workspaceMembers.userId,
          role: workspaceMembers.role,
          joinedAt: workspaceMembers.joinedAt,
          email: users.email,
        })
        .from(workspaceMembers)
        .innerJoin(users, eq(users.id, workspaceMembers.userId))
        .where(eq(workspaceMembers.workspaceId, ctx.workspaceId))
        .orderBy(workspaceMembers.joinedAt);

      return members;
    }),

  /** Invite a user by email — sends a Resend invitation email */
  inviteMember: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).default("VIEWER"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      requireAdminOrOwner(ctx.workspaceRole);
      await requireBusinessPlan(ctx.user.id);

      // Prevent inviting yourself
      if (input.email === ctx.user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot invite yourself",
        });
      }

      // Check if user is already a member
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        const [existingMembership] = await db
          .select()
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.workspaceId, ctx.workspaceId),
              eq(workspaceMembers.userId, existingUser.id)
            )
          )
          .limit(1);

        if (existingMembership) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This user is already a member of this workspace",
          });
        }
      }

      // Get workspace name for the email
      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, ctx.workspaceId))
        .limit(1);

      // Generate invite token and store it
      const token = generateInviteToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

      await db.insert(workspaceInvites).values({
        workspaceId: ctx.workspaceId,
        email: input.email,
        role: input.role,
        token,
        invitedBy: ctx.user.id,
        expiresAt,
      });

      // Send the invite email via Resend
      await sendWorkspaceInviteEmail(
        input.email,
        workspace.name,
        ctx.user.email,
        token,
        input.role
      );

      return { message: `Invitation sent to ${input.email}` };
    }),

  /** Accept a workspace invite via token */
  acceptInvite: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const [invite] = await db
        .select()
        .from(workspaceInvites)
        .where(eq(workspaceInvites.token, input.token))
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid invitation link",
        });
      }

      if (invite.acceptedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has already been accepted",
        });
      }

      if (new Date() > invite.expiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has expired",
        });
      }

      // Check if user is already a member
      const [existingMembership] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, invite.workspaceId),
            eq(workspaceMembers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingMembership) {
        // Mark invite as accepted anyway
        await db
          .update(workspaceInvites)
          .set({ acceptedAt: new Date() })
          .where(eq(workspaceInvites.id, invite.id));

        return { message: "You are already a member of this workspace", workspaceId: invite.workspaceId };
      }

      // Add user to workspace and mark invite as accepted
      await db.transaction(async (tx) => {
        await tx.insert(workspaceMembers).values({
          workspaceId: invite.workspaceId,
          userId: ctx.user.id,
          role: invite.role,
        });

        await tx
          .update(workspaceInvites)
          .set({ acceptedAt: new Date() })
          .where(eq(workspaceInvites.id, invite.id));
      });

      return { message: "You have joined the workspace!", workspaceId: invite.workspaceId };
    }),

  /** Get invite details by token (public for displaying invite info) */
  getInviteDetails: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const [invite] = await db
        .select({
          id: workspaceInvites.id,
          email: workspaceInvites.email,
          role: workspaceInvites.role,
          expiresAt: workspaceInvites.expiresAt,
          acceptedAt: workspaceInvites.acceptedAt,
          workspaceName: workspaces.name,
          inviterEmail: users.email,
        })
        .from(workspaceInvites)
        .innerJoin(workspaces, eq(workspaces.id, workspaceInvites.workspaceId))
        .innerJoin(users, eq(users.id, workspaceInvites.invitedBy))
        .where(eq(workspaceInvites.token, input.token))
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid invitation link",
        });
      }

      return {
        workspaceName: invite.workspaceName,
        inviterEmail: invite.inviterEmail,
        role: invite.role,
        isExpired: new Date() > invite.expiresAt,
        isAccepted: !!invite.acceptedAt,
      };
    }),

  /** Get pending invites for a workspace */
  getPendingInvites: workspaceProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx }) => {
      requireAdminOrOwner(ctx.workspaceRole);

      const invites = await db
        .select({
          id: workspaceInvites.id,
          email: workspaceInvites.email,
          role: workspaceInvites.role,
          createdAt: workspaceInvites.createdAt,
          expiresAt: workspaceInvites.expiresAt,
          acceptedAt: workspaceInvites.acceptedAt,
        })
        .from(workspaceInvites)
        .where(eq(workspaceInvites.workspaceId, ctx.workspaceId))
        .orderBy(desc(workspaceInvites.createdAt));

      return invites;
    }),

  /** Remove a member from the workspace */
  removeMember: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        memberId: z.string().uuid(), // workspaceMembers.id
      })
    )
    .mutation(async ({ input, ctx }) => {
      requireAdminOrOwner(ctx.workspaceRole);

      const [target] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.id, input.memberId),
            eq(workspaceMembers.workspaceId, ctx.workspaceId)
          )
        )
        .limit(1);

      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in this workspace",
        });
      }

      // Cannot remove the OWNER
      if (target.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the workspace owner",
        });
      }

      // ADMIN cannot remove another ADMIN (only OWNER can)
      if (target.role === "ADMIN" && ctx.workspaceRole !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the workspace owner can remove admins",
        });
      }

      await db
        .delete(workspaceMembers)
        .where(eq(workspaceMembers.id, input.memberId));

      return { message: "Member removed successfully" };
    }),

  /** Update a member's role (OWNER only) */
  updateMemberRole: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        memberId: z.string().uuid(),
        role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.workspaceRole !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the workspace owner can change member roles",
        });
      }

      const [target] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.id, input.memberId),
            eq(workspaceMembers.workspaceId, ctx.workspaceId)
          )
        )
        .limit(1);

      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (target.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the owner's role",
        });
      }

      await db
        .update(workspaceMembers)
        .set({ role: input.role })
        .where(eq(workspaceMembers.id, input.memberId));

      return { message: `Role updated to ${input.role}` };
    }),

  // ─── Workspace-scoped Form Operations ───────────────────────────────

  /** Create a form within a workspace (VIEWER cannot create) */
  createForm: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.workspaceRole === "VIEWER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Viewers cannot create forms. Contact your workspace admin for elevated permissions.",
        });
      }

      const slug = await createUniqueSlug(input.title);

      const [newForm] = await db
        .insert(forms)
        .values({
          userId: ctx.user.id,
          workspaceId: ctx.workspaceId,
          title: input.title,
          description: input.description ?? null,
          slug,
          visibility: "PUBLIC",
          status: "DRAFT",
        })
        .returning();

      return { message: "Form created successfully", form: newForm };
    }),

  /** List all forms belonging to a workspace */
  getWorkspaceForms: workspaceProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx }) => {
      const workspaceForms = await db
        .select()
        .from(forms)
        .where(eq(forms.workspaceId, ctx.workspaceId))
        .orderBy(desc(forms.createdAt));

      return workspaceForms;
    }),
});
