/**
 * Organisasi Service
 * Menangani CRUD dan operasi hierarki organisasi
 */

import { db } from "@/shared/db";
import {
  OrganisasiDTO,
  OrganisasiWithTree,
} from "../types";
import { CreateOrganisasiInput, UpdateOrganisasiInput } from "../schemas";


export const OrganisasiService = {
  /**
   * Buat organisasi baru
   */
  create: async (
    data: CreateOrganisasiInput,
    createdBy: string
  ): Promise<OrganisasiDTO> => {
    return db.organisasi.create({
      data: {
        ...data,
        createdBy,
      },
    });
  },

  /**
   * Update organisasi
   */
  update: async (
    id: string,
    data: UpdateOrganisasiInput,
    updatedBy: string
  ): Promise<OrganisasiDTO> => {
    return db.organisasi.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  },

  /**
   * Hapus organisasi (soft delete)
   */
  delete: async (id: string, deletedBy: string): Promise<void> => {
    await db.organisasi.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: deletedBy,
      },
    });
  },

  /**
   * Ambil organisasi by ID
   */
  getById: async (id: string): Promise<OrganisasiDTO | null> => {
    return db.organisasi.findUnique({
      where: { id },
    });
  },

  /**
   * Ambil semua organisasi (non-deleted)
   */
  getAll: async (
    jenis?: "STRUKTURAL" | "KELOMPOK_KERJA"
  ): Promise<OrganisasiDTO[]> => {
    const where = jenis ? { jenis, deletedAt: null } : { deletedAt: null };
    return db.organisasi.findMany({
      where,
      orderBy: { nama: "asc" },
    });
  },

  /**
   * Ambil daftar organisasi yang bisa dipilih sebagai induk
   */
  getParentOrganisasi: async (): Promise<OrganisasiDTO[]> => {
    return db.organisasi.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [{ indukOrganisasiId: "asc" }, { nama: "asc" }],
    });
  },

  /**
   * Ambil organisasi dengan hierarki (tree structure)
   */
  getTree: async (): Promise<OrganisasiWithTree[]> => {
    const organisasi = await db.organisasi.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { daftarAnggota: true },
        },
      },
      orderBy: { nama: "asc" },
    });

    const map = new Map<string, OrganisasiWithTree>();
    const roots: OrganisasiWithTree[] = [];

    organisasi.forEach((org) => {
      const dto: OrganisasiWithTree = {
        id: org.id,
        nama: org.nama,
        singkatan: org.singkatan,
        status: org.status,
        jenis: org.jenis,
        eselon: org.eselon,
        punyaAnggaran: org.punyaAnggaran,
        indukOrganisasiId: org.indukOrganisasiId,
        createdAt: org.createdAt,
        createdBy: org.createdBy,
        updatedAt: org.updatedAt,
        updatedBy: org.updatedBy,
        deletedAt: org.deletedAt,
        subOrganisasi: [],
        jumlahAnggota: org._count.daftarAnggota,
      };
      map.set(org.id, dto);
    });

    organisasi.forEach((org) => {
      const current = map.get(org.id)!;
      if (org.indukOrganisasiId) {
        const parent = map.get(org.indukOrganisasiId);
        if (parent) {
          parent.subOrganisasi.push(current);
        }
      } else {
        roots.push(current);
      }
    });

    return roots;
  },

  /**
   * Ambil sub-organisasi dari parent tertentu
   */
  getSubOrganisasi: async (parentId: string): Promise<OrganisasiDTO[]> => {
    return db.organisasi.findMany({
      where: {
        indukOrganisasiId: parentId,
        deletedAt: null,
      },
      orderBy: { nama: "asc" },
    });
  },

  /**
   * Ambil sub-organisasi (alias)
   */
  getChildOrganisasi: async (parentId: string): Promise<OrganisasiDTO[]> => {
    return OrganisasiService.getSubOrganisasi(parentId);
  },

  /**
   * Ambil path dari organisasi ke root (untuk breadcrumb)
   */
  getHierarchyPath: async (id: string): Promise<OrganisasiDTO[]> => {
    const path: OrganisasiDTO[] = [];
    let current = await OrganisasiService.getById(id);

    while (current) {
      path.unshift(current);
      if (current.indukOrganisasiId) {
        current = await OrganisasiService.getById(current.indukOrganisasiId);
      } else {
        break;
      }
    }

    return path;
  },

  /**
   * Ambil organisasi dengan pimpinan aktif
   */
  getWithPimpinanAktif: async (id: string) => {
    const organisasi = await db.organisasi.findUnique({
      where: { id },
      include: {
        daftarPimpinan: {
          where: { aktif: true },
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
        _count: {
          select: { daftarAnggota: true },
        },
      },
    });

    return organisasi;
  },

  /**
   * Validasi organisasi exists
   */
  exists: async (id: string): Promise<boolean> => {
    const count = await db.organisasi.count({
      where: { id, deletedAt: null },
    });
    return count > 0;
  },
};

