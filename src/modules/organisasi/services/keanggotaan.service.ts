/**
 * Keanggotaan Service
 * Menangani manajemen anggota organisasi
 */

import { db } from "@/shared/db";
import { KeanggotaanDTO, PeranKeanggotaan, ApiResponse } from "../types";
import { CreateKeanggotaanInput, CreateKeanggotaanByEmailInput } from "../schemas";

export const KeanggotaanService = {
  /**
   * Tambah anggota ke organisasi
   */
  addMember: async (
    data: CreateKeanggotaanInput,
    createdBy: string
  ): Promise<KeanggotaanDTO> => {
    // Validasi: user harus exist
    const user = await db.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Validasi: organisasi harus exist
    const org = await db.organisasi.findUnique({
      where: { id: data.organisasiId },
    });

    if (!org) {
      throw new Error("Organisasi tidak ditemukan");
    }

    // Check: user sudah member di org ini?
    const existing = await db.keanggotaan.findFirst({
      where: {
        organisasiId: data.organisasiId,
        userId: data.userId,
        aktif: true,
      },
    });

    if (existing) {
      throw new Error("User sudah menjadi anggota organisasi ini");
    }

    return db.keanggotaan.create({
      data: {
        organisasiId: data.organisasiId,
        userId: data.userId,
        peran: data.peran || "ANGGOTA",
        tanggalMulai: data.tanggalMulai || new Date(),
        catatan: data.catatan,
        aktif: true,
      },
    });
  },

  /**
   * Tambah anggota berdasarkan email
   */
  addMemberByEmail: async (
    data: CreateKeanggotaanByEmailInput,
    createdBy: string
  ): Promise<KeanggotaanDTO> => {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error("User dengan email tersebut tidak ditemukan");
    }

    return KeanggotaanService.addMember(
      {
        organisasiId: data.organisasiId,
        userId: user.id,
        peran: data.peran,
        catatan: data.catatan,
        tanggalMulai: new Date(),
      },
      createdBy
    );
  },

  /**
   * Update peran anggota
   */
  updatePeran: async (
    keanggotaanId: string,
    peran: PeranKeanggotaan
  ): Promise<KeanggotaanDTO> => {
    return db.keanggotaan.update({
      where: { id: keanggotaanId },
      data: { peran },
    });
  },

  /**
   * Hapus anggota dari organisasi
   */
  removeMember: async (keanggotaanId: string): Promise<void> => {
    await db.keanggotaan.update({
      where: { id: keanggotaanId },
      data: {
        aktif: false,
        tanggalSelesai: new Date(),
      },
    });
  },

  /**
   * Ambil semua anggota organisasi
   */
  getOrganizationMembers: async (organisasiId: string) => {
    return db.keanggotaan.findMany({
      where: { organisasiId, aktif: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { tanggalMulai: "desc" },
    });
  },

  /**
   * Ambil organisasi di mana user adalah anggota
   */
  getUserOrganizations: async (userId: string) => {
    return db.keanggotaan.findMany({
      where: { userId, aktif: true },
      include: {
        organisasi: true,
      },
      orderBy: { tanggalMulai: "desc" },
    });
  },

  /**
   * Ambil detail keanggotaan
   */
  getById: async (id: string) => {
    return db.keanggotaan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        organisasi: true,
      },
    });
  },

  /**
   * Validasi: keanggotaan exists dan aktif
   */
  isValidMembership: async (id: string): Promise<boolean> => {
    const count = await db.keanggotaan.count({
      where: { id, aktif: true },
    });
    return count > 0;
  },

  /**
   * Hitung jumlah anggota dalam organisasi
   */
  getMemberCount: async (organisasiId: string): Promise<number> => {
    return db.keanggotaan.count({
      where: { organisasiId, aktif: true },
    });
  },
};

/**
 * User Search Service
 * Mencari user untuk keperluan organisasi
 */
export const UserSearchService = {
  /**
   * Cari user berdasarkan nama atau email
   * Exclude user yang sudah menjadi anggota organisasi tertentu
   */
  searchUsersForOrganisasi: async (
    query: string,
    organisasiId?: string,
    limit: number = 10
  ) => {
    const searchLower = query.toLowerCase();

    // Jika organisasiId diberikan, exclude user yang sudah member aktif
    let excludeUserIds: string[] = [];
    if (organisasiId) {
      const existingMembers = await db.keanggotaan.findMany({
        where: { organisasiId, aktif: true },
        select: { userId: true },
      });
      excludeUserIds = existingMembers.map((m) => m.userId);
    }

    return db.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchLower, mode: "insensitive" } },
              { email: { contains: searchLower, mode: "insensitive" } },
            ],
          },
          { id: { notIn: excludeUserIds } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: [{ name: "asc" }, { email: "asc" }],
    });
  },
};
