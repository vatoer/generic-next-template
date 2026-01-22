/**
 * Profil Service
 * Menangani profil pengguna (PERSONAL, ORGANISASI, EKSTERNAL)
 */

import { db } from "@/utils/db";
import { ProfilDTO } from "../types";
import { CreateProfilInput } from "../schemas";

export class ProfilService {
  /**
   * Buat profil baru untuk user
   */
  static async createProfile(
    data: CreateProfilInput,
    createdBy: string
  ): Promise<ProfilDTO> {
    // Jika isDefault true, set profil lain sebagai non-default
    if (data.isDefault) {
      await db.profil.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }

    return db.profil.create({
      data: {
        userId: data.userId,
        nama: data.nama,
        avatar: data.avatar,
        tipe: data.tipe || "PERSONAL",
        isDefault: data.isDefault || false,
        aktif: true,
        createdBy,
      },
    });
  }

  /**
   * Update profil
   */
  static async updateProfile(
    id: string,
    data: Partial<CreateProfilInput>,
    updatedBy: string
  ): Promise<ProfilDTO> {
    // Jika isDefault diubah ke true, set yang lain ke false
    if (data.isDefault === true) {
      const profil = await db.profil.findUnique({ where: { id } });
      if (profil) {
        await db.profil.updateMany({
          where: { userId: profil.userId, id: { not: id } },
          data: { isDefault: false },
        });
      }
    }

    return db.profil.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Hapus profil (soft delete)
   */
  static async deleteProfile(id: string, deletedBy: string): Promise<void> {
    await db.profil.update({
      where: { id },
      data: {
        aktif: false,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Ambil semua profil user
   */
  static async getUserProfiles(userId: string) {
    return db.profil.findMany({
      where: { userId, aktif: true, deletedAt: null },
      include: {
        peranProfil: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  /**
   * Ambil profil default user
   */
  static async getDefaultProfile(userId: string): Promise<ProfilDTO | null> {
    return db.profil.findFirst({
      where: { userId, isDefault: true, aktif: true, deletedAt: null },
    });
  }

  /**
   * Ambil profil by ID
   */
  static async getById(id: string) {
    return db.profil.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        peranProfil: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        dataKeanggotaan: {
          include: {
            organisasi: true,
          },
        },
      },
    });
  }

  /**
   * Set profil sebagai aktif (switch)
   */
  static async switchProfile(userId: string, profilId: string): Promise<ProfilDTO> {
    // Validasi profil milik user ini
    const profil = await db.profil.findUnique({
      where: { id: profilId },
    });

    if (!profil || profil.userId !== userId) {
      throw new Error("Profil tidak ditemukan atau bukan milik user");
    }

    if (!profil.aktif) {
      throw new Error("Profil tidak aktif");
    }

    // Update: profil ini jadi default
    await db.profil.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return db.profil.update({
      where: { id: profilId },
      data: { isDefault: true },
    });
  }

  /**
   * Berikan role ke profil
   */
  static async assignRoleToProfile(profilId: string, roleId: string) {
    return db.profilRole.upsert({
      where: {
        profilId_roleId: { profilId, roleId },
      },
      create: { profilId, roleId },
      update: {},
    });
  }

  /**
   * Hapus role dari profil
   */
  static async removeRoleFromProfile(profilId: string, roleId: string): Promise<void> {
    await db.profilRole.delete({
      where: {
        profilId_roleId: { profilId, roleId },
      },
    });
  }

  /**
   * Ambil izin (permissions) dari profil
   */
  static async getProfilePermissions(profilId: string): Promise<string[]> {
    const profilRoles = await db.profilRole.findMany({
      where: { profilId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    profilRoles.forEach((pr) => {
      pr.role.permissions.forEach((rp) => {
        permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
      });
    });

    return Array.from(permissions);
  }
}
