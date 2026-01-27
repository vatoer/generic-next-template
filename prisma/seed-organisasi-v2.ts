import 'dotenv/config';
import { db } from '@/utils/db';
import { faker } from '@faker-js/faker';

/**
 * Seeder untuk Organisasi V2 - Refined
 * Membuat 10 parent organisasi (eselon null/0)
 * Setiap parent memiliki minimal 3 sub-organisasi (eselon 1-4)
 */

const PARENT_ORGS_DATA = [
  { nama: 'Kementerian Kesehatan', singkatan: 'Kemenkes' },
  { nama: 'Kementerian Pendidikan', singkatan: 'Kemendikbud' },
  { nama: 'Kementerian Dalam Negeri', singkatan: 'Kemendagri' },
  { nama: 'Kementerian Pertahanan', singkatan: 'Kemhan' },
  { nama: 'Kementerian Pekerjaan Umum', singkatan: 'Kemen PU' },
  { nama: 'Kementerian Keuangan', singkatan: 'Kemenkeu' },
  { nama: 'Kementerian Pertanian', singkatan: 'Kementan' },
  { nama: 'Kementerian Luar Negeri', singkatan: 'Kemenlu' },
  { nama: 'Kementerian Energi', singkatan: 'Kemen Energi' },
  { nama: 'Kementerian Industri', singkatan: 'Kemenperin' },
];

/**
 * Fungsi untuk membuat struktur sub-organisasi 4 level
 * Level 1: Direktorat Jenderal (eselon 1)
 * Level 2: Direktorat (eselon 2)
 * Level 3: Subdirektorat (eselon 3)
 * Level 4: Bidang (eselon 4)
 */
async function createOrgHierarchy(
  parentId: string,
  parentName: string,
  createdBy: string,
  index: number
) {
  const orgs: any[] = [];
  const departments = ['Sumber Daya Manusia', 'Keuangan', 'Operasional', 'Teknologi', 'Perencanaan'];
  
  // Level 1: Direktorat Jenderal (3 direktorat)
  for (let i = 0; i < 3; i++) {
    const deptName = departments[i] || faker.commerce.department();
    const org = await db.organisasi.upsert({
      where: {
        id: `org-${index}-dijenderal-${i}`,
      },
      update: {},
      create: {
        id: `org-${index}-dijenderal-${i}`,
        nama: `Direktorat Jenderal ${deptName}`,
        singkatan: `Ditjen ${deptName.substring(0, 4)}`,
        status: 'AKTIF',
        jenis: 'STRUKTURAL',
        eselon: 1,
        punyaAnggaran: true,
        indukOrganisasiId: parentId,
        createdBy,
      },
    });
    orgs.push(org);

    // Level 2: Direktorat (3 per Ditjen)
    for (let j = 0; j < 3; j++) {
      const divName = faker.commerce.department();
      const direktorat = await db.organisasi.upsert({
        where: {
          id: `org-${index}-dir-${i}-${j}`,
        },
        update: {},
        create: {
          id: `org-${index}-dir-${i}-${j}`,
          nama: `Direktorat ${divName}`,
          singkatan: `Dir ${divName.substring(0, 3)}`,
          status: 'AKTIF',
          jenis: 'STRUKTURAL',
          eselon: 2,
          punyaAnggaran: true,
          indukOrganisasiId: org.id,
          createdBy,
        },
      });
      orgs.push(direktorat);

      // Level 3: Subdirektorat (2 per Direktorat)
      for (let k = 0; k < 2; k++) {
        const subName = faker.commerce.department();
        const subdit = await db.organisasi.upsert({
          where: {
            id: `org-${index}-subdit-${i}-${j}-${k}`,
          },
          update: {},
          create: {
            id: `org-${index}-subdit-${i}-${j}-${k}`,
            nama: `Subdirektorat ${subName}`,
            singkatan: `Subdit ${subName.substring(0, 3)}`,
            status: 'AKTIF',
            jenis: 'STRUKTURAL',
            eselon: 3,
            punyaAnggaran: false,
            indukOrganisasiId: direktorat.id,
            createdBy,
          },
        });
        orgs.push(subdit);

        // Level 4: Bidang (2 per Subdirektorat)
        for (let l = 0; l < 2; l++) {
          const bidName = faker.commerce.department();
          const bidang = await db.organisasi.upsert({
            where: {
              id: `org-${index}-bid-${i}-${j}-${k}-${l}`,
            },
            update: {},
            create: {
              id: `org-${index}-bid-${i}-${j}-${k}-${l}`,
              nama: `Bidang ${bidName}`,
              singkatan: `Bid ${bidName.substring(0, 3)}`,
              status: 'AKTIF',
              jenis: 'STRUKTURAL',
              eselon: 4,
              punyaAnggaran: false,
              indukOrganisasiId: subdit.id,
              createdBy,
            },
          });
          orgs.push(bidang);
        }
      }
    }
  }

  return orgs;
}

export async function seedOrganisasiV2() {
  console.log('🏢 Seeding organisasi v2 (10 parent + hierarchy)...');

  // Ambil user admin
  const adminUser = await db.user.findFirst({
    where: { email: 'admin@stargan.id' },
  });

  if (!adminUser) {
    console.log('❌ Admin user tidak ditemukan');
    return [];
  }

  const allOrgs: any[] = [];

  // Buat 10 parent organisasi
  for (let idx = 0; idx < PARENT_ORGS_DATA.length; idx++) {
    const parentData = PARENT_ORGS_DATA[idx];

    // Buat parent org (eselon 0 - no eselon)
    const parent = await db.organisasi.upsert({
      where: {
        id: `org-parent-${idx}`,
      },
      update: {},
      create: {
        id: `org-parent-${idx}`,
        nama: parentData.nama,
        singkatan: parentData.singkatan,
        status: 'AKTIF',
        jenis: 'STRUKTURAL',
        eselon: null, // Parent level = no eselon
        punyaAnggaran: true,
        createdBy: adminUser.id,
      },
    });

    console.log(`  ✓ ${parent.nama}`);
    allOrgs.push(parent);

    // Buat hierarchy untuk setiap parent
    const childOrgs = await createOrgHierarchy(parent.id, parent.nama, adminUser.id, idx);
    allOrgs.push(...childOrgs);
  }

  console.log(`✅ Organisasi v2 seeded (Total: ${allOrgs.length} organisasi)`);
  return allOrgs;
}
