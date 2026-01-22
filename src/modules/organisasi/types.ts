// Type definitions untuk Organisasi Module

export type OrganisasiStatus = "AKTIF" | "NON_AKTIF" | "DIBUBARKAN";
export type JenisOrganisasi = "STRUKTURAL" | "KELOMPOK_KERJA";
export type TipeKepemimpinan = "DEFINITIF" | "PLT" | "PLH";
export type PeranKeanggotaan = "ANGGOTA" | "PEJABAT" | "PLT" | "PLH" | "ADMIN";

// DTO: Data Transfer Objects
export interface OrganisasiDTO {
  id: string;
  nama: string;
  singkatan?: string;
  status: OrganisasiStatus;
  jenis: JenisOrganisasi;
  eselon?: number;
  punyaAnggaran: boolean;
  indukOrganisasiId?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
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
  tanggalSelesai?: Date;
  aktif: boolean;
  catatan?: string;
}

export interface RiwayatPimpinanDTO {
  id: string;
  organisasiId: string;
  keanggotaanId: string;
  tipeKepemimpinan: TipeKepemimpinan;
  tanggalMulai: Date;
  tanggalSelesai?: Date;
  aktif: boolean;
  alasan?: string;
  pimpinanDigantikanId?: string;
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
  avatar?: string;
  tipe: "PERSONAL" | "ORGANISASI" | "EKSTERNAL";
  isDefault: boolean;
  aktif: boolean;
  keanggotaanId?: string;
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
