// Type definitions untuk Organisasi Module

export type OrganisasiStatus = "AKTIF" | "NON_AKTIF" | "DIBUBARKAN";
export type JenisOrganisasi = "STRUKTURAL" | "KELOMPOK_KERJA";
export type TipeKepemimpinan = "DEFINITIF" | "PLT" | "PLH";
export type PeranKeanggotaan = "ANGGOTA" | "PEJABAT" | "PLT" | "PLH" | "ADMIN";

// DTO: Data Transfer Objects
export interface OrganisasiDTO {
  id: string;
  nama: string;
  singkatan: string | null;
  status: OrganisasiStatus;
  jenis: JenisOrganisasi;
  eselon: number | null;
  punyaAnggaran: boolean;
  indukOrganisasiId: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
}

export interface OrganisasiWithTree extends OrganisasiDTO {
  subOrganisasi: OrganisasiWithTree[];
  jumlahAnggota: number;
  pimpinanAktif?: PimpinanAktifDTO;
}

export interface KeanggotaanDTO {
  id: string;
  organisasiId: string;
  userId: string;
  peran: PeranKeanggotaan;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  aktif: boolean;
  catatan: string | null;
}

export interface RiwayatPimpinanDTO {
  id: string;
  organisasiId: string;
  keanggotaanId: string;
  tipeKepemimpinan: TipeKepemimpinan;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  aktif: boolean;
  alasan: string | null;
  pimpinanDigantikanId: string | null;
}

export interface PimpinanAktifDTO {
  id: string;
  nama: string;
  email: string;
  tipeKepemimpinan: TipeKepemimpinan;
  tanggalMulai: Date;
}

export interface ProfilDTO {
  id: string;
  userId: string;
  nama: string;
  avatar: string | null;
  tipe: "PERSONAL" | "ORGANISASI" | "EKSTERNAL";
  isDefault: boolean;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  keanggotaanId: string | null;
  organisasiId?: string;
  organisasi?: {
    id: string;
    nama: string;
  };
  deskripsi?: string;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface TreeNode<T> {
  node: T;
  children: TreeNode<T>[];
}
