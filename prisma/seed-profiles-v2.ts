// @ts-nocheck
import 'dotenv/config';
import { db } from '@/utils/db';
import { faker } from '@faker-js/faker/locale/id_ID';
import bcrypt from 'bcryptjs';

/**
 * Seeder untuk Profile & User V2 - Refined
 * Membuat minimal 10 user per organizational unit
 * Setiap user memiliki profil PERSONAL + ORGANISASI
 */

const ROLES_OPTIONS = ['ANGGOTA', 'PEJABAT', 'PLT', 'PLH'];

export async function seedProfilesV2() {
  console.log('👥 Seeding profiles v2 (10+ user per org)...');

  const adminUser = await db.user.findFirst({
    where: { email: 'admin@stargan.id' },
  });

  if (!adminUser) {
    console.log('❌ Admin user tidak ditemukan');
    return;
  }

  // Ambil semua organisasi level bidang (leaf nodes - eselon 4)
  const bidangs = await db.organisasi.findMany({
    where: { eselon: 4, status: 'AKTIF' },
  });

  console.log(`📊 Ditemukan ${bidangs.length} bidang (unit terkecil)`);

  let totalUsersCreated = 0;
  let totalProfilesCreated = 0;

  // Untuk setiap bidang, buat 10 user
  for (const bidang of bidangs) {
    console.log(`  📁 ${bidang.nama}...`);

    for (let userIdx = 0; userIdx < 10; userIdx++) {
      try {
        // Generate user data
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${bidang.singkatan}.${userIdx}@stargan.id`
          .replace(/\s+/g, '')
          .substring(0, 100);
        const nip = faker.string.numeric({ length: 18 });
        const password = await bcrypt.hash('password123', 10);

        // Cek apakah user sudah ada
        const existingUser = await db.user.findUnique({
          where: { email },
        });

        let user;
        if (existingUser) {
          user = existingUser;
        } else {
          user = await db.user.create({
            data: {
              email,
              name: fullName,
              emailVerified: true,
            },
          });
          totalUsersCreated++;
        }

        // Buat personal profile
        const personalProfile = await db.profil.upsert({
          where: {
            userId_jenis: {
              userId: user.id,
              jenis: 'PERSONAL',
            },
          },
          update: {},
          create: {
            userId: user.id,
            jenis: 'PERSONAL',
            nama: fullName,
            status: 'AKTIF',
            avatar: faker.image.avatar(),
          },
        });
        totalProfilesCreated++;

        // Buat organisasi profile
        const orgProfile = await db.profil.upsert({
          where: {
            userId_jenis_organisasiId: {
              userId: user.id,
              jenis: 'ORGANISASI',
              organisasiId: bidang.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            jenis: 'ORGANISASI',
            nama: fullName,
            status: 'AKTIF',
            organisasiId: bidang.id,
            avatar: faker.image.avatar(),
          },
        });
        totalProfilesCreated++;

        // Assign roles to personal profile
        const personalRoles = [
          { peran: 'ANGGOTA', status: 'AKTIF' },
          { peran: faker.helpers.arrayElement(['PEJABAT', 'PLT']), status: 'AKTIF' },
        ];

        for (const roleData of personalRoles) {
          await db.profilRole.upsert({
            where: {
              profilId_peran: {
                profilId: personalProfile.id,
                peran: roleData.peran,
              },
            },
            update: {},
            create: {
              profilId: personalProfile.id,
              peran: roleData.peran,
              status: roleData.status,
            },
          });
        }

        // Assign roles to org profile
        const orgRoles = [
          { peran: 'ANGGOTA', status: 'AKTIF' },
          { peran: faker.helpers.arrayElement(['PEJABAT', 'PLT', 'ANGGOTA']), status: 'AKTIF' },
        ];

        for (const roleData of orgRoles) {
          await db.profilRole.upsert({
            where: {
              profilId_peran: {
                profilId: orgProfile.id,
                peran: roleData.peran,
              },
            },
            update: {},
            create: {
              profilId: orgProfile.id,
              peran: roleData.peran,
              status: roleData.status,
            },
          });
        }

        // Buat keanggotaan
        await db.keanggotaan.upsert({
          where: {
            userId_organisasiId: {
              userId: user.id,
              organisasiId: bidang.id,
            },
          },
          update: {
            status: 'AKTIF',
          },
          create: {
            userId: user.id,
            organisasiId: bidang.id,
            peran: faker.helpers.arrayElement(ROLES_OPTIONS),
            status: 'AKTIF',
            catatan: faker.lorem.sentence(),
          },
        });

        // Random: Assign ke 1-2 parent organizations juga
        const parentOrgs = await db.organisasi.findMany({
          where: {
            id: { not: bidang.id },
            OR: [
              { id: bidang.indukOrganisasiId || undefined },
              {
                indukOrganisasiId: await db.organisasi
                  .findUnique({ where: { id: bidang.indukOrganisasiId || '' } })
                  .then(org => org?.indukOrganisasiId),
              },
            ],
          },
          take: 2,
        });

        // Tambah keanggotaan ke parent org (20% chance)
        if (Math.random() < 0.2 && parentOrgs.length > 0) {
          const randomParent = faker.helpers.arrayElement(parentOrgs);
          await db.keanggotaan.upsert({
            where: {
              userId_organisasiId: {
                userId: user.id,
                organisasiId: randomParent.id,
              },
            },
            update: {},
            create: {
              userId: user.id,
              organisasiId: randomParent.id,
              peran: 'ANGGOTA',
              status: 'AKTIF',
              catatan: faker.lorem.sentence(),
            },
          });
        }
      } catch (error) {
        console.error(`    ❌ Gagal create user untuk ${bidang.nama}:`, error);
      }
    }
  }

  console.log(
    `✅ Profiles v2 seeded (${totalUsersCreated} users, ${totalProfilesCreated} profiles created)`
  );
}
