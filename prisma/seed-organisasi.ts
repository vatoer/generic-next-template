import 'dotenv/config';
import { db } from '@/shared/db';
import { faker } from '@faker-js/faker';

/**
 * Seeder untuk Organisasi
 * Membuat struktur organisasi hierarki dengan data fake
 */

export async function seedOrganisasi() {
  console.log('🏢 Seeding organisasi...');

  // Ambil user admin
  const adminUser = await db.user.findFirst({
    where: { email: 'admin@stargan.id' },
  });

  if (!adminUser) {
    console.log('❌ Admin user tidak ditemukan');
    return;
  }

  // Root organisasi (Kementerian)
  const kemenkes = await db.organisasi.upsert({
    where: {
      id: 'org-kemenkes',
    },
    update: {},
    create: {
      id: 'org-kemenkes',
      nama: 'Kementerian Kesehatan',
      singkatan: 'Kemenkes',
      status: 'AKTIF',
      jenis: 'STRUKTURAL',
      eselon: 1,
      punyaAnggaran: true,
      createdBy: adminUser.id,
    },
  });

  // Level 2: Direktorat
  const direktoratJenderal = await db.organisasi.upsert({
    where: {
      id: 'org-ditjen-p2p',
    },
    update: {},
    create: {
      id: 'org-ditjen-p2p',
      nama: 'Direktorat Jenderal Pencegahan dan Pengendalian Penyakit',
      singkatan: 'Ditjen P2P',
      status: 'AKTIF',
      jenis: 'STRUKTURAL',
      eselon: 2,
      punyaAnggaran: true,
      indukOrganisasiId: kemenkes.id,
      createdBy: adminUser.id,
    },
  });

  // Level 3: Direktorat
  const direktoratSurveilan = await db.organisasi.upsert({
    where: {
      id: 'org-direktorat-si',
    },
    update: {},
    create: {
      id: 'org-direktorat-si',
      nama: 'Direktorat Surveilans dan Imunisasi',
      singkatan: 'Direktorat SI',
      status: 'AKTIF',
      jenis: 'STRUKTURAL',
      eselon: 3,
      punyaAnggaran: true,
      indukOrganisasiId: direktoratJenderal.id,
      createdBy: adminUser.id,
    },
  });

  // Level 4: Subdirektorat
  const subdirektoratSurveilan = await db.organisasi.upsert({
    where: {
      id: 'org-subdit-se',
    },
    update: {},
    create: {
      id: 'org-subdit-se',
      nama: 'Subdirektorat Surveilans Epidemiologi',
      singkatan: 'Subdit SE',
      status: 'AKTIF',
      jenis: 'STRUKTURAL',
      eselon: 4,
      punyaAnggaran: false,
      indukOrganisasiId: direktoratSurveilan.id,
      createdBy: adminUser.id,
    },
  });

  // Level 5: Bidang
  const bidangAnalisis = await db.organisasi.upsert({
    where: {
      id: 'org-bid-analisis',
    },
    update: {},
    create: {
      id: 'org-bid-analisis',
      nama: 'Bidang Analisis Data',
      singkatan: 'Bid. Analisis',
      status: 'AKTIF',
      jenis: 'STRUKTURAL',
      eselon: 5,
      punyaAnggaran: false,
      indukOrganisasiId: subdirektoratSurveilan.id,
      createdBy: adminUser.id,
    },
  });

  // Task Force / Kelompok Kerja
  const pokjaResponse = await db.organisasi.upsert({
    where: {
      id: 'org-pokja-vaksin',
    },
    update: {},
    create: {
      id: 'org-pokja-vaksin',
      nama: 'Pokja Vaksinasi COVID-19',
      singkatan: 'Pokja Vaksin',
      status: 'AKTIF',
      jenis: 'KELOMPOK_KERJA',
      punyaAnggaran: true,
      indukOrganisasiId: direktoratJenderal.id,
      createdBy: adminUser.id,
    },
  });

  console.log('✅ Organisasi seeded');
  return {
    kemenkes,
    direktoratJenderal,
    direktoratSurveilan,
    subdirektoratSurveilan,
    bidangAnalisis,
    pokjaResponse,
  };
}
