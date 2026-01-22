import 'dotenv/config';
import { db } from '@/utils/db';
import { faker } from '@faker-js/faker';

/**
 * Seeder untuk Multi Profile (Profil Pengguna)
 * Membuat berbagai profil untuk user yang berbeda
 */

export async function seedProfiles() {
  console.log('👤 Seeding profil pengguna...');

  // Ambil admin user
  const adminUser = await db.user.findFirst({
    where: { email: 'admin@stargan.id' },
  });

  if (!adminUser) {
    console.log('❌ Admin user tidak ditemukan');
    return;
  }

  // Get organisasi untuk keperluan profil
  const orgs = await db.organisasi.findMany({
    take: 3,
  });

  // Profil Personal Default
  const profilPersonal = await db.profil.upsert({
    where: {
      id: `profil-${adminUser.id}-personal`,
    },
    update: {},
    create: {
      id: `profil-${adminUser.id}-personal`,
      userId: adminUser.id,
      nama: 'Personal',
      tipe: 'PERSONAL',
      isDefault: true,
      aktif: true,
      createdBy: adminUser.id,
    },
  });

  console.log(`  ✓ Profil Personal: ${profilPersonal.nama}`);

  // Buat beberapa profil organisasi
  if (orgs.length > 0) {
    for (let i = 0; i < Math.min(orgs.length, 3); i++) {
      const org = orgs[i];

      // Buat atau ambil keanggotaan untuk user di org ini
      let keanggotaan = await db.keanggotaan.findFirst({
        where: {
          organisasiId: org.id,
          userId: adminUser.id,
        },
      });

      if (!keanggotaan) {
        keanggotaan = await db.keanggotaan.create({
          data: {
            organisasiId: org.id,
            userId: adminUser.id,
            peran: 'PEJABAT',
            aktif: true,
            createdAt: new Date(),
          },
        });
      }

      const profilOrg = await db.profil.upsert({
        where: {
          id: `profil-${adminUser.id}-org-${org.id}`,
        },
        update: {},
        create: {
          id: `profil-${adminUser.id}-org-${org.id}`,
          userId: adminUser.id,
          nama: `${org.singkatan || org.nama}`,
          tipe: 'ORGANISASI',
          isDefault: i === 0 && false,
          aktif: true,
          keanggotaanId: keanggotaan.id,
          createdBy: adminUser.id,
        },
      });

      console.log(`  ✓ Profil Organisasi: ${profilOrg.nama}`);

      // Assign roles ke profil ini
      const roles = await db.role.findMany({ take: 2 });
      for (const role of roles) {
        await db.profilRole.upsert({
          where: {
            profilId_roleId: {
              profilId: profilOrg.id,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            profilId: profilOrg.id,
            roleId: role.id,
          },
        });
      }
    }
  }

  // Buat profil eksternal
  const profilEksternal = await db.profil.upsert({
    where: {
      id: `profil-${adminUser.id}-eksternal`,
    },
    update: {},
    create: {
      id: `profil-${adminUser.id}-eksternal`,
      userId: adminUser.id,
      nama: 'Konsultan',
      tipe: 'EKSTERNAL',
      isDefault: false,
      aktif: true,
      createdBy: adminUser.id,
    },
  });

  console.log(`  ✓ Profil Eksternal: ${profilEksternal.nama}`);

  // Assign minimal role ke profil personal
  const roles = await db.role.findMany({ take: 1 });
  if (roles.length > 0) {
    await db.profilRole.upsert({
      where: {
        profilId_roleId: {
          profilId: profilPersonal.id,
          roleId: roles[0].id,
        },
      },
      update: {},
      create: {
        profilId: profilPersonal.id,
        roleId: roles[0].id,
      },
    });
  }

  console.log('✅ Profil seeded');

  return {
    profilPersonal,
    profilEksternal,
  };
}

/**
 * Seeder untuk membuat user tambahan dengan multi profile
 */
export async function seedAdditionalUsersWithProfiles() {
  console.log('👥 Seeding user tambahan dengan profil...');

  const orgs = await db.organisasi.findMany({ take: 3 });

  if (orgs.length === 0) {
    console.log('❌ Organisasi tidak ditemukan');
    return;
  }

  const users = [];

  // Buat 3 user tambahan
  for (let i = 0; i < 3; i++) {
    const email = `user${i + 1}@stargan.id`;

    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        name: faker.person.fullName(),
        email,
        emailVerified: true,
      },
    });

    // Buat profil personal
    const profilPersonal = await db.profil.upsert({
      where: {
        id: `profil-${user.id}-personal`,
      },
      update: {},
      create: {
        id: `profil-${user.id}-personal`,
        userId: user.id,
        nama: 'Personal',
        tipe: 'PERSONAL',
        isDefault: true,
        aktif: true,
        createdBy: user.id,
      },
    });

    // Assign ke organisasi dengan role
    const org = orgs[i % orgs.length];
    let keanggotaan = await db.keanggotaan.findFirst({
      where: {
        organisasiId: org.id,
        userId: user.id,
      },
    });

    if (!keanggotaan) {
      keanggotaan = await db.keanggotaan.create({
        data: {
          organisasiId: org.id,
          userId: user.id,
          peran: 'PEJABAT',
          aktif: true,
        },
      });
    }

    const profilOrg = await db.profil.upsert({
      where: {
        id: `profil-${user.id}-org-${org.id}`,
      },
      update: {},
      create: {
        id: `profil-${user.id}-org-${org.id}`,
        userId: user.id,
        nama: org.singkatan || org.nama,
        tipe: 'ORGANISASI',
        isDefault: false,
        aktif: true,
        keanggotaanId: keanggotaan.id,
        createdBy: user.id,
      },
    });

    // Assign roles
    const roles = await db.role.findMany({ take: 2 });
    for (const role of roles) {
      await db.profilRole.upsert({
        where: {
          profilId_roleId: {
            profilId: profilOrg.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          profilId: profilOrg.id,
          roleId: role.id,
        },
      });
    }

    users.push(user);
    console.log(`  ✓ User: ${user.email} dengan profil di ${org.nama}`);
  }

  console.log('✅ User tambahan seeded');
  return users;
}
