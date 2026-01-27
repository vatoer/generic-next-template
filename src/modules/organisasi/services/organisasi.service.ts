/**
 * Organisasi Service
 * Menangani CRUD dan operasi hierarki organisasi
 */

import { db } from "@/utils/db";
import {
  OrganisasiDTO,
  OrganisasiWithTree,
  TreeNode,
  ApiResponse,
} from "../types";
import { CreateOrganisasiInput, UpdateOrganisasiInput } from "../schemas";

export class OrganisasiService {
  /**
   * Buat organisasi baru
   */
  static async create(
    data: CreateOrganisasiInput,
    createdBy: string
  ): Promise<OrganisasiDTO> {
    return db.organisasi.create({
      data: {
        ...data,
        createdBy,
      },
    });
  }

  /**
   * Update organisasi
   */
  static async update(
    id: string,
    data: UpdateOrganisasiInput,
    updatedBy: string
  ): Promise<OrganisasiDTO> {
    return db.organisasi.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Hapus organisasi (soft delete)
   */
  static async delete(id: string, deletedBy: string): Promise<void> {
    await db.organisasi.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: deletedBy,
      },
    });
  }

  /**
   * Ambil organisasi by ID
   */
  static async getById(id: string): Promise<OrganisasiDTO | null> {
    return db.organisasi.findUnique({
      where: { id },
    });
  }

  /**
   * Ambil semua organisasi (non-deleted)
   */
  static async getAll(
    jenis?: "STRUKTURAL" | "KELOMPOK_KERJA"
  ): Promise<OrganisasiDTO[]> {
    const where = jenis ? { jenis, deletedAt: null } : { deletedAt: null };
    return db.organisasi.findMany({
      where,
      orderBy: { nama: "asc" },
    });
  }

  /**
   * Ambil daftar organisasi yang bisa dipilih sebagai induk
   * Dipakai untuk searchable parent select
   */
  static async getParentOrganisasi(): Promise<OrganisasiDTO[]> {
    return db.organisasi.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [{ indukOrganisasiId: "asc" }, { nama: "asc" }],
    });
  }

  /**
   * Ambil organisasi dengan hierarki (tree structure)
   */
  static async getTree(): Promise<OrganisasiWithTree[]> {
    const organisasi = await db.organisasi.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { daftarAnggota: true },
        },
      },
      orderBy: { nama: "asc" },
    });

    // Build tree structure
    const map = new Map<string, OrganisasiWithTree>();
    const roots: OrganisasiWithTree[] = [];

    // First pass: convert to DTO dengan subOrganisasi array
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

    // Second pass: build hierarchy
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
  }

  /**
   * Ambil sub-organisasi dari parent tertentu
   */
  static async getSubOrganisasi(parentId: string): Promise<OrganisasiDTO[]> {
    return db.organisasi.findMany({
      where: {
        indukOrganisasiId: parentId,
        deletedAt: null,
      },
      orderBy: { nama: "asc" },
    });
  }

  /**
   * Ambil sub-organisasi (alias) digunakan oleh actions
   */
  static async getChildOrganisasi(parentId: string): Promise<OrganisasiDTO[]> {
    return this.getSubOrganisasi(parentId);
  }

  /**
   * Ambil path dari organisasi ke root (untuk breadcrumb)
   */
  static async getHierarchyPath(id: string): Promise<OrganisasiDTO[]> {
    const path: OrganisasiDTO[] = [];
    let current = await this.getById(id);

    while (current) {
      path.unshift(current);
      if (current.indukOrganisasiId) {
        current = await this.getById(current.indukOrganisasiId);
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * Ambil organisasi dengan pimpinan aktif
   */
  static async getWithPimpinanAktif(id: string) {
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
  }

  /**
   * Validasi organisasi exists
   */
  static async exists(id: string): Promise<boolean> {
    const count = await db.organisasi.count({
      where: { id, deletedAt: null },
    });
    return count > 0;
  }
}

