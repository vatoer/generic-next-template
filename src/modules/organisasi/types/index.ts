// Re-export all types from schemas for backward compatibility
// Types are inferred from Zod schemas to ensure consistency

export type {
  OrganisasiStatus,
  JenisOrganisasi,
  TipeKepemimpinan,
  PeranKeanggotaan,
  ProfilTipe,
  OrganisasiDTO,
  OrganisasiWithTree,
  KeanggotaanDTO,
  RiwayatPimpinanDTO,
  PimpinanAktifDTO,
  ProfilDTO,
  CreateOrganisasiInput,
  UpdateOrganisasiInput,
  CreateKeanggotaanInput,
  CreateKeanggotaanByEmailInput,
  CreateRiwayatPimpinanInput,
  CreateProfilInput,
} from "../schemas";

// Generic response types
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export type TreeNode<T> = {
  node: T;
  children: TreeNode<T>[];
};
