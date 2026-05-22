import cron from 'node-cron';
import { db, users } from '@repo/database';
import { eq, and, lt } from 'drizzle-orm';

export const startCronJobs = () => {

  cron.schedule('0 * * * *', async () => {
    console.log('🧹 [CRON] Running cleanup job for unverified users...');
    
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const deletedUsers = await db.delete(users)
        .where(
          and(
            eq(users.isEmailVerified, false),
            lt(users.createdAt, oneDayAgo)
          )
        )
        .returning({ id: users.id, email: users.email });

      if (deletedUsers.length > 0) {
        console.log(`✅ [CRON] Successfully purged ${deletedUsers.length} unverified accounts.`);
      } else {
        console.log('✨ [CRON] No unverified accounts needed cleanup.');
      }
      
    } catch (error) {
      console.error('🚨 [CRON] Error during unverified user cleanup:', error);
    }
  });
};