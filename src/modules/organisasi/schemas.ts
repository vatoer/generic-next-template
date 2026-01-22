import { z } from "zod";

// Skema validasi Organisasi
export const createOrganisasiSchema = z.object({
  nama: z.string().min(1, "Nama organisasi wajib diisi").max(255),
  singkatan: z.string().max(50).optional(),
  status: z.enum(["AKTIF", "NON_AKTIF", "DIBUBARKAN"]).default("AKTIF"),
  jenis: z.enum(["STRUKTURAL", "KELOMPOK_KERJA"]).default("STRUKTURAL"),
  eselon: z.number().int().positive().optional(),
  punyaAnggaran: z.boolean().default(false),
  indukOrganisasiId: z.string().optional(),
});

export const updateOrganisasiSchema = createOrganisasiSchema.partial();

// Skema validasi Keanggotaan
export const createKeanggotaanSchema = z.object({
  organisasiId: z.string().cuid("ID organisasi tidak valid"),
  userId: z.string().cuid("ID user tidak valid"),
  peran: z.enum(["ANGGOTA", "PEJABAT", "PLT", "PLH", "ADMIN"]).default("ANGGOTA"),
  tanggalMulai: z.date().default(() => new Date()),
  catatan: z.string().optional(),
});

// Skema validasi RiwayatPimpinan
export const createRiwayatPimpinanSchema = z.object({
  organisasiId: z.string().cuid("ID organisasi tidak valid"),
  keanggotaanId: z.string().cuid("ID keanggotaan tidak valid"),
  tipeKepemimpinan: z.enum(["DEFINITIF", "PLT", "PLH"]),
  alasan: z.string().optional(),
});

// Skema validasi Profil
export const createProfilSchema = z.object({
  userId: z.string().cuid("ID user tidak valid"),
  nama: z.string().min(1, "Nama profil wajib diisi").max(255),
  tipe: z.enum(["PERSONAL", "ORGANISASI", "EKSTERNAL"]).default("PERSONAL"),
  avatar: z.string().url().optional(),
  isDefault: z.boolean().default(false),
});

export type CreateOrganisasiInput = z.infer<typeof createOrganisasiSchema>;
export type UpdateOrganisasiInput = z.infer<typeof updateOrganisasiSchema>;
export type CreateKeanggotaanInput = z.infer<typeof createKeanggotaanSchema>;
export type CreateRiwayatPimpinanInput = z.infer<typeof createRiwayatPimpinanSchema>;
export type CreateProfilInput = z.infer<typeof createProfilSchema>;
