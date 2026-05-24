import { db, forms } from "@repo/database";
import { eq } from "drizzle-orm";
async function test() {
  const res = await db.select().from(forms).where(eq(forms.isTemplate, true));
  console.log(res);
  process.exit(0);
}
test();
