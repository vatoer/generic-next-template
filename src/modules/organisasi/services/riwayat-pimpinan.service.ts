/**
 * Riwayat Pimpinan Service
 * Menangani suksesi kepemimpinan dengan Prisma Transaction
 */

import { db } from "@/utils/db";
import { RiwayatPimpinanDTO, TipeKepemimpinan, PimpinanAktifDTO } from "../types";
import { CreateRiwayatPimpinanInput } from "../schemas";

export class RiwayatPimpinanService {
  /**
   * Penugasan pimpinan baru (dengan suksesi otomatis)
   * Flow:
   * 1. Cari pimpinan aktif saat ini (tipe apapun)
   * 2. Update pimpinan lama: aktif=false, tanggalSelesai=now
   * 3. Buat pimpinan baru dengan referensi pimpinanDigantikanId
   */
  static async assignLeader(
    data: CreateRiwayatPimpinanInput,
    assignedBy: string
  ): Promise<RiwayatPimpinanDTO> {
    return db.$transaction(async (tx) => {
      // Validasi: keanggotaan exists
      const keanggotaan = await tx.keanggotaan.findUnique({
        where: { id: data.keanggotaanId },
      });

      if (!keanggotaan) {
        throw new Error("Keanggotaan tidak ditemukan");
      }

      if (keanggotaan.organisasiId !== data.organisasiId) {
        throw new Error(
          "Keanggotaan tidak sesuai dengan organisasi yang ditargetkan"
        );
      }

      // Cari pimpinan aktif saat ini di organisasi ini
      const pimpinanLama = await tx.riwayatPimpinan.findFirst({
        where: {
          organisasiId: data.organisasiId,
          aktif: true,
        },
      });

      let replacedLeaderId: string | undefined;

      // Jika ada pimpinan lama, update menjadi non-aktif
      if (pimpinanLama) {
        await tx.riwayatPimpinan.update({
          where: { id: pimpinanLama.id },
          data: {
            aktif: false,
            tanggalSelesai: new Date(),
          },
        });
        replacedLeaderId = pimpinanLama.id;
      }

      // Buat pimpinan baru
      const pimpinanBaru = await tx.riwayatPimpinan.create({
        data: {
          organisasiId: data.organisasiId,
          keanggotaanId: data.keanggotaanId,
          tipeKepemimpinan: data.tipeKepemimpinan,
          tanggalMulai: new Date(),
          alasan: data.alasan,
          pimpinanDigantikanId: replacedLeaderId,
          aktif: true,
        },
      });

      return pimpinanBaru;
    });
  }

  /**
   * Hentikan pimpinan saat ini (end tenure)
   */
  static async endLeadership(id: string): Promise<void> {
    await db.riwayatPimpinan.update({
      where: { id },
      data: {
        aktif: false,
        tanggalSelesai: new Date(),
      },
    });
  }

  /**
   * Ambil pimpinan aktif saat ini untuk organisasi
   */
  static async getActiveLeader(organisasiId: string): Promise<PimpinanAktifDTO | null> {
    const riwayat = await db.riwayatPimpinan.findFirst({
      where: { organisasiId, aktif: true },
      include: {
        keanggotaan: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!riwayat) return null;

    return {
      id: riwayat.id,
      nama: riwayat.keanggotaan.user.name,
      email: riwayat.keanggotaan.user.email,
      tipeKepemimpinan: riwayat.tipeKepemimpinan,
      tanggalMulai: riwayat.tanggalMulai,
    };
  }

  /**
   * Ambil semua pimpinan (aktif dan non-aktif) untuk organisasi
   */
  static async getLeadershipHistory(organisasiId: string) {
    return db.riwayatPimpinan.findMany({
      where: { organisasiId },
      include: {
        keanggotaan: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        penerus: {
          include: {
            keanggotaan: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { tanggalMulai: "desc" },
    });
  }

  /**
   * Ambil detail riwayat pimpinan
   */
  static async getById(id: string) {
    return db.riwayatPimpinan.findUnique({
      where: { id },
      include: {
        organisasi: true,
        keanggotaan: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        pimpinanDigantikan: {
          include: {
            keanggotaan: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Ambil pimpinan berdasarkan tipe (DEFINITIF/PLT/PLH) yang aktif
   */
  static async getActiveLeadersByType(
    organisasiId: string,
    tipe: TipeKepemimpinan
  ) {
    return db.riwayatPimpinan.findMany({
      where: {
        organisasiId,
        tipeKepemimpinan: tipe,
        aktif: true,
      },
      include: {
        keanggotaan: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  /**
   * Validasi: leadership exists dan aktif
   */
  static async isValidLeadership(id: string): Promise<boolean> {
    const count = await db.riwayatPimpinan.count({
      where: { id, aktif: true },
    });
    return count > 0;
  }
}
