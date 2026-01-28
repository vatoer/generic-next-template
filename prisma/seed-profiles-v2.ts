// @ts-nocheck
import { db } from "@/shared/db";
import { faker } from "@faker-js/faker/locale/id_ID";

export async function seedProfilesV2() {
  console.log("👥 Seeding profiles v2 (10+ user per org)...");

  // Get all leaf organizations (no sub-organisations)
  const allOrgs = await db.organisasi.findMany({
    include: {
      subOrganisasi: true,
    },
  });

  const bidangs = allOrgs.filter((org) => org.subOrganisasi.length === 0);
  console.log(`📊 Ditemukan ${bidangs.length} bidang (unit terkecil)`);

  let totalUsersCreated = 0;
  let totalProfilesCreated = 0;

  // Untuk setiap bidang, buat 10 users
  for (const bidang of bidangs) {
    console.log(`  📁 Bidang ${bidang.nama}...`);

    for (let userIdx = 0; userIdx < 10; userIdx++) {
      try {
        // Generate user data
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${userIdx}@stargan.id`
          .replace(/\s+/g, "")
          .substring(0, 100);

        // Cek apakah user sudah ada
        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
              name: fullName,
              emailVerified: true,
            },
          });
          totalUsersCreated++;
        }

        // Buat keanggotaan (membership) di organisasi
        let keanggotaan = await db.keanggotaan.findFirst({
          where: {
            organisasiId: bidang.id,
            userId: user.id,
          },
        });

        if (!keanggotaan) {
          keanggotaan = await db.keanggotaan.create({
            data: {
              organisasiId: bidang.id,
              userId: user.id,
              peran: faker.helpers.arrayElement([
                "ANGGOTA",
                "PEJABAT",
                "PLT",
              ]),
              aktif: true,
            },
          });
        }

        // Buat personal profile
        const personalProfile = await db.profil.upsert({
          where: {
            userId_tipe: {
              userId: user.id,
              tipe: "PERSONAL",
            },
          },
          update: {},
          create: {
            userId: user.id,
            tipe: "PERSONAL",
            nama: fullName,
            createdBy: user.id,
            avatar: faker.image.avatar(),
          },
        });
        totalProfilesCreated++;

        // Buat organisasi profile dengan keanggotaan
        const orgProfile = await db.profil.upsert({
          where: {
            userId_tipe_keanggotaanId: {
              userId: user.id,
              tipe: "ORGANISASI",
              keanggotaanId: keanggotaan.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            tipe: "ORGANISASI",
            nama: `${fullName} - ${bidang.nama}`,
            keanggotaanId: keanggotaan.id,
            createdBy: user.id,
            avatar: faker.image.avatar(),
          },
        });
        totalProfilesCreated++;
      } catch (error) {
        // Silently handle duplicates
      }
    }
  }

  console.log(
    `✅ Profiles v2 seeded (${totalUsersCreated} users, ${totalProfilesCreated} profiles created)`
  );
}
