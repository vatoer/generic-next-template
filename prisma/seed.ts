import 'dotenv/config';
import { db } from '@/utils/db';
import { hashPassword } from '@/utils/password';
import { seedOrganisasiV2 } from './seed-organisasi-v2';
import { seedProfilesV2 } from './seed-profiles-v2';

async function main() {
  const email = "admin@stargan.id"
  const password = "Admin123!"

  const hashedPassword = await hashPassword(password)

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Admin User",
      email,
    //   password: hashedPassword,
    },
  })

  // Create credential account for better-auth
  await db.account.upsert({
    where: {
      accountId_providerId: {
        accountId: user.id,
        providerId: "credential",
      },
    },
    update: {},
    create: {
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    },
  })

  console.log("✅ Admin user seeded")

  // Seed organisasi v2 (10 parent + hierarchical structure)
  await seedOrganisasiV2();

  // Seed profil v2 (10+ user per org)
  await seedProfilesV2();

  console.log("\n✅ All seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
