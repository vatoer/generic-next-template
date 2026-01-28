import { z } from "zod";

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const organisasiStatusSchema = z.enum([
  "AKTIF",
  "NON_AKTIF",
  "DIBUBARKAN",
]);

export const jenisOrganisasiSchema = z.enum(["STRUKTURAL", "KELOMPOK_KERJA"]);

export const tipeKepemimpinanSchema = z.enum(["DEFINITIF", "PLT", "PLH"]);

export const peranKeanggotaanSchema = z.enum([
  "ANGGOTA",
  "PEJABAT",
  "PLT",
  "PLH",
  "ADMIN",
]);

export const profilTipeSchema = z.enum(["PERSONAL", "ORGANISASI", "EKSTERNAL"]);

// ============================================================================
// DTO SCHEMAS (Response/Database Models)
// ============================================================================

/**
 * Schema untuk organisasi yang dikembalikan dari database
 */
export const organisasiDTOSchema = z.object({
  id: z.cuid(),
  nama: z.string().min(1).max(255),
  singkatan: z.string().max(50).nullable(),
  status: organisasiStatusSchema,
  jenis: jenisOrganisasiSchema,
  eselon: z.number().int().nonnegative().nullable(),
  punyaAnggaran: z.boolean(),
  indukOrganisasiId: z.cuid().nullable(),
  createdAt: z.date(),
  createdBy: z.cuid(),
  updatedAt: z.date().nullable(),
  updatedBy: z.cuid().nullable(),
  deletedAt: z.date().nullable(),
});

/**
 * Schema untuk organisasi dengan tree structure
 */
export const organisasiWithTreeSchema: z.ZodType<any> = organisasiDTOSchema.extend({
  subOrganisasi: z.lazy(() => organisasiWithTreeSchema.array()),
  jumlahAnggota: z.number().int().nonnegative(),
  pimpinanAktif: z
    .object({
      id: z.cuid(),
      nama: z.string(),
      email: z.email(),
      tipeKepemimpinan: tipeKepemimpinanSchema,
      tanggalMulai: z.date(),
    })
    .optional(),
});

/**
 * Schema untuk keanggotaan organisasi
 */
export const keanggotaanDTOSchema = z.object({
  id: z.cuid(),
  organisasiId: z.cuid(),
  userId: z.cuid(),
  peran: peranKeanggotaanSchema,
  tanggalMulai: z.date(),
  tanggalSelesai: z.date().nullable(),
  aktif: z.boolean(),
  catatan: z.string().nullable(),
});

/**
 * Schema untuk riwayat pimpinan
 */
export const riwayatPimpinanDTOSchema = z.object({
  id: z.cuid(),
  organisasiId: z.cuid(),
  keanggotaanId: z.cuid(),
  tipeKepemimpinan: tipeKepemimpinanSchema,
  tanggalMulai: z.date(),
  tanggalSelesai: z.date().nullable(),
  aktif: z.boolean(),
  alasan: z.string().nullable(),
  pimpinanDigantikanId: z.cuid().nullable(),
});

/**
 * Schema untuk pimpinan aktif (simplified view)
 */
export const pimpinanAktifDTOSchema = z.object({
  id: z.cuid(),
  nama: z.string(),
  email: z.email(),
  tipeKepemimpinan: tipeKepemimpinanSchema,
  tanggalMulai: z.date(),
});

/**
 * Schema untuk profil pengguna
 */
export const profilDTOSchema = z.object({
  id: z.cuid(),
  userId: z.cuid(),
  nama: z.string().min(1).max(255),
  avatar: z.string().url().nullable(),
  tipe: profilTipeSchema,
  isDefault: z.boolean(),
  aktif: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  createdBy: z.cuid(),
  updatedBy: z.cuid().nullable(),
  deletedAt: z.date().nullable(),
  deletedBy: z.cuid().nullable(),
  keanggotaanId: z.cuid().nullable(),
  organisasiId: z.cuid().optional(),
  organisasi: z
    .object({
      id: z.cuid(),
      nama: z.string(),
    })
    .optional(),
  deskripsi: z.string().optional(),
});

/**
 * Schema untuk response API
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    errors: z.record(z.string(), z.array(z.string())).optional(),
  });

/**
 * Schema untuk tree node
 */
export const treeNodeSchema = <T extends z.ZodTypeAny>(
  nodeSchema: T
): z.ZodObject<{
  node: T;
  children: z.ZodArray<any>;
}> =>
  z.object({
    node: nodeSchema,
    children: z.lazy(() => treeNodeSchema(nodeSchema).array()),
  }) as any;

// ============================================================================
// INPUT SCHEMAS (Create/Update Requests)
// ============================================================================

/**
 * Skema validasi untuk membuat organisasi
 */
export const createOrganisasiSchema = z.object({
  nama: z.string().min(1, "Nama organisasi wajib diisi").max(255),
  singkatan: z.string().max(50).optional(),
  status: organisasiStatusSchema.optional(),
  jenis: jenisOrganisasiSchema.optional(),
  eselon: z.number().int().nonnegative().optional(),
  punyaAnggaran: z.boolean().optional(),
  indukOrganisasiId: z.cuid().optional(),
});

/**
 * Skema validasi untuk update organisasi
 */
export const updateOrganisasiSchema = createOrganisasiSchema.partial();

/**
 * Skema validasi untuk menambah keanggotaan
 */
export const createKeanggotaanSchema = z.object({
  organisasiId: z.cuid("ID organisasi tidak valid"),
  userId: z.cuid("ID user tidak valid"),
  peran: peranKeanggotaanSchema.default("ANGGOTA"),
  tanggalMulai: z.date().default(() => new Date()),
  catatan: z.string().optional(),
});

/**
 * Skema validasi untuk menambah keanggotaan via email
 */
export const createKeanggotaanByEmailSchema = z.object({
  organisasiId: z.cuid("ID organisasi tidak valid"),
  email: z.string().email("Email tidak valid"),
  peran: peranKeanggotaanSchema.default("ANGGOTA"),
  catatan: z.string().optional(),
});

/**
 * Skema validasi untuk membuat riwayat pimpinan
 */
export const createRiwayatPimpinanSchema = z.object({
  organisasiId: z.cuid("ID organisasi tidak valid"),
  keanggotaanId: z.cuid("ID keanggotaan tidak valid"),
  tipeKepemimpinan: tipeKepemimpinanSchema,
  alasan: z.string().optional(),
});

/**
 * Skema validasi untuk membuat profil
 */
export const createProfilSchema = z.object({
  userId: z.cuid("ID user tidak valid"),
  nama: z.string().min(1, "Nama profil wajib diisi").max(255),
  deskripsi: z.string().max(1000).optional(),
  tipe: profilTipeSchema.default("PERSONAL"),
  avatar: z.string().url().optional(),
  isDefault: z.boolean().default(false),
  organisasiId: z.cuid().optional().nullable(),
});

// ============================================================================
// TYPE EXPORTS (Inferred from Schemas)
// ============================================================================

// Enum types
export type OrganisasiStatus = z.infer<typeof organisasiStatusSchema>;
export type JenisOrganisasi = z.infer<typeof jenisOrganisasiSchema>;
export type TipeKepemimpinan = z.infer<typeof tipeKepemimpinanSchema>;
export type PeranKeanggotaan = z.infer<typeof peranKeanggotaanSchema>;
export type ProfilTipe = z.infer<typeof profilTipeSchema>;

// DTO types
export type OrganisasiDTO = z.infer<typeof organisasiDTOSchema>;
export type OrganisasiWithTree = z.infer<typeof organisasiWithTreeSchema>;
export type KeanggotaanDTO = z.infer<typeof keanggotaanDTOSchema>;
export type RiwayatPimpinanDTO = z.infer<typeof riwayatPimpinanDTOSchema>;
export type PimpinanAktifDTO = z.infer<typeof pimpinanAktifDTOSchema>;
export type ProfilDTO = z.infer<typeof profilDTOSchema>;

// Input types
export type CreateOrganisasiInput = z.infer<typeof createOrganisasiSchema>;
export type UpdateOrganisasiInput = z.infer<typeof updateOrganisasiSchema>;
export type CreateKeanggotaanInput = z.infer<typeof createKeanggotaanSchema>;
export type CreateKeanggotaanByEmailInput = z.infer<
  typeof createKeanggotaanByEmailSchema
>;
export type CreateRiwayatPimpinanInput = z.infer<
  typeof createRiwayatPimpinanSchema
>;
export type CreateProfilInput = z.infer<typeof createProfilSchema>;

// Generic response types
export type ApiResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<z.ZodType<T>>>>;
export type TreeNode<T> = z.infer<ReturnType<typeof treeNodeSchema<z.ZodType<T>>>>;

