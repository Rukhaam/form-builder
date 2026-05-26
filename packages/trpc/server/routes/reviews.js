import { router, publicProcedure, protectedProcedure } from "../trpc.js";
import { submitReviewSchema } from "@repo/schemas";
import { db, formReviews } from "@repo/database";
import { eq, avg, count, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const reviewsRouter = router({
    getFormReviews: publicProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input }) => {
      const reviews = await db
        .select()
        .from(formReviews)
        .where(eq(formReviews.formId, input.formId));

      return reviews;
    }),

    submit:protectedProcedure
    .input(submitReviewSchema)
    .mutation(async({input,ctx})=>{
          const userId = ctx.user.id;

          // Allowing multiple reviews for testing average score calculation
          /*
         const [existingReview] = await db
        .select()
        .from(formReviews)
        .where(and(eq(formReviews.formId, input.formId), eq(formReviews.userId, userId)))
        .limit(1);

        if(existingReview){
            await db.update(formReviews).set({rating:input.rating, createdAt: new Date()}).where(eq(formReviews.id, existingReview.id));
            return {success:true , message: "Review updated successfully" };
        }
        */

            await db.insert(formReviews).values({
                formId:input.formId,
                userId,
                rating:input.rating
            })
      return {success:true , message: "Review submitted successfully" };
        }),
        
    getStats: publicProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input }) => {
      const [stats] = await db
        .select({
          averageRating: avg(formReviews.rating),
          totalReviews: count(formReviews.id),
        })
        .from(formReviews)
        .where(eq(formReviews.formId, input.formId));

      return {

        averageRating: stats?.averageRating ? Number(Number(stats.averageRating).toFixed(1)) : 0,
        totalReviews: stats?.totalReviews ?? 0,
      };
    }),
})
    
