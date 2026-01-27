-- CreateEnum
CREATE TYPE "StatusOrganisasi" AS ENUM ('AKTIF', 'NON_AKTIF', 'DIBUBARKAN');

-- CreateEnum
CREATE TYPE "JenisOrganisasi" AS ENUM ('STRUKTURAL', 'KELOMPOK_KERJA');

-- CreateEnum
CREATE TYPE "TipeKepemimpinan" AS ENUM ('DEFINITIF', 'PLT', 'PLH');

-- CreateEnum
CREATE TYPE "PeranKeanggotaan" AS ENUM ('ANGGOTA', 'PEJABAT', 'PLT', 'PLH', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipeProfil" AS ENUM ('PERSONAL', 'ORGANISASI', 'EKSTERNAL');

-- CreateTable
CREATE TABLE "organisasi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "status" "StatusOrganisasi" NOT NULL DEFAULT 'AKTIF',
    "jenis" "JenisOrganisasi" NOT NULL DEFAULT 'STRUKTURAL',
    "eselon" INTEGER,
    "punya_anggaran" BOOLEAN NOT NULL DEFAULT false,
    "induk_organisasi_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keanggotaan_organisasi" (
    "id" TEXT NOT NULL,
    "organisasi_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "peran" "PeranKeanggotaan" NOT NULL DEFAULT 'ANGGOTA',
    "tanggal_mulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "keanggotaan_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_pimpinan_organisasi" (
    "id" TEXT NOT NULL,
    "organisasi_id" TEXT NOT NULL,
    "keanggotaan_id" TEXT NOT NULL,
    "tipe_kepemimpinan" "TipeKepemimpinan" NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_selesai" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "alasan" TEXT,
    "pimpinan_digantikan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "riwayat_pimpinan_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_pengguna" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "avatar" TEXT,
    "tipe" "TipeProfil" NOT NULL DEFAULT 'PERSONAL',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "keanggotaanId" TEXT,

    CONSTRAINT "profil_pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_roles" (
    "id" TEXT NOT NULL,
    "profil_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "profil_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organisasi_induk_organisasi_id_idx" ON "organisasi"("induk_organisasi_id");

-- CreateIndex
CREATE INDEX "keanggotaan_organisasi_organisasi_id_idx" ON "keanggotaan_organisasi"("organisasi_id");

-- CreateIndex
CREATE INDEX "keanggotaan_organisasi_user_id_idx" ON "keanggotaan_organisasi"("user_id");

-- CreateIndex
CREATE INDEX "keanggotaan_organisasi_organisasi_id_peran_idx" ON "keanggotaan_organisasi"("organisasi_id", "peran");

-- CreateIndex
CREATE INDEX "riwayat_pimpinan_organisasi_organisasi_id_idx" ON "riwayat_pimpinan_organisasi"("organisasi_id");

-- CreateIndex
CREATE INDEX "riwayat_pimpinan_organisasi_keanggotaan_id_idx" ON "riwayat_pimpinan_organisasi"("keanggotaan_id");

-- CreateIndex
CREATE INDEX "riwayat_pimpinan_organisasi_organisasi_id_tipe_kepemimpinan_idx" ON "riwayat_pimpinan_organisasi"("organisasi_id", "tipe_kepemimpinan");

-- CreateIndex
CREATE INDEX "profil_pengguna_user_id_idx" ON "profil_pengguna"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profil_roles_profil_id_role_id_key" ON "profil_roles"("profil_id", "role_id");

-- AddForeignKey
ALTER TABLE "organisasi" ADD CONSTRAINT "organisasi_induk_organisasi_id_fkey" FOREIGN KEY ("induk_organisasi_id") REFERENCES "organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keanggotaan_organisasi" ADD CONSTRAINT "keanggotaan_organisasi_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keanggotaan_organisasi" ADD CONSTRAINT "keanggotaan_organisasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pimpinan_organisasi" ADD CONSTRAINT "riwayat_pimpinan_organisasi_pimpinan_digantikan_id_fkey" FOREIGN KEY ("pimpinan_digantikan_id") REFERENCES "riwayat_pimpinan_organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pimpinan_organisasi" ADD CONSTRAINT "riwayat_pimpinan_organisasi_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pimpinan_organisasi" ADD CONSTRAINT "riwayat_pimpinan_organisasi_keanggotaan_id_fkey" FOREIGN KEY ("keanggotaan_id") REFERENCES "keanggotaan_organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_keanggotaanId_fkey" FOREIGN KEY ("keanggotaanId") REFERENCES "keanggotaan_organisasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_roles" ADD CONSTRAINT "profil_roles_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "profil_pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_roles" ADD CONSTRAINT "profil_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
