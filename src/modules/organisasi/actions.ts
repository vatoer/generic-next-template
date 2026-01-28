"use server";

/**
 * Server Actions untuk Organisasi Module
 * Digunakan dari client components dengan autentikasi & validasi
 */

import { auth } from "@/shared/auth";
import { headers } from "next/headers";
import {
  OrganisasiService,
  KeanggotaanService,
  RiwayatPimpinanService,
  ProfilService,
  UserSearchService,
} from "./services";
import {
  createOrganisasiSchema,
  updateOrganisasiSchema,
  createKeanggotaanSchema,
  createKeanggotaanByEmailSchema,
  createRiwayatPimpinanSchema,
  createProfilSchema,
} from "./schemas";
import type { ApiResponse, PeranKeanggotaan } from "./types";

/**
 * ===== ORGANISASI ACTIONS =====
 */

export async function createOrganisasiAction(
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = createOrganisasiSchema.parse(data);
    const result = await OrganisasiService.create(validated, session.user.id);

    return {
      success: true,
      message: "Organisasi berhasil dibuat",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membuat organisasi",
    };
  }
}

export async function updateOrganisasiAction(
  id: string,
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = updateOrganisasiSchema.parse(data);
    const result = await OrganisasiService.update(id, validated, session.user.id);

    return {
      success: true,
      message: "Organisasi berhasil diperbarui",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui organisasi",
    };
  }
}

export async function deleteOrganisasiAction(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    await OrganisasiService.delete(id, session.user.id);

    return {
      success: true,
      message: "Organisasi berhasil dihapus",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus organisasi",
    };
  }
}

export async function getOrganisasiTreeAction(): Promise<ApiResponse<any>> {
  try {
    const result = await OrganisasiService.getTree();
    return {
      success: true,
      message: "Data pohon organisasi berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data organisasi",
    };
  }
}

export async function getOrganisasiListAction(): Promise<ApiResponse<any>> {
  try {
    const result = await OrganisasiService.getAll();
    return {
      success: true,
      message: "Daftar organisasi berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil daftar organisasi",
    };
  }
}


export async function getParentOrganisasiListAction(): Promise<ApiResponse<any>> {
  try {
    const result = await OrganisasiService.getParentOrganisasi();
    return {
      success: true,
      message: "Daftar organisasi induk berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil daftar organisasi induk",
    };
  }
}

export async function getChildOrganisasiAction(
  parentId: string
): Promise<ApiResponse<any>> {
  try {
    const result = await OrganisasiService.getChildOrganisasi(parentId);
    return {
      success: true,
      message: "Daftar sub-organisasi berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil daftar sub-organisasi",
    };
  }
}

export async function getOrganisasiAction(id: string): Promise<ApiResponse<any>> {
  try {
    const result = await OrganisasiService.getById(id);
    if (!result) {
      return {
        success: false,
        message: "Organisasi tidak ditemukan",
      };
    }
    return {
      success: true,
      message: "Data organisasi berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data organisasi",
    };
  }
}

/**
 * ===== KEANGGOTAAN ACTIONS =====
 */

export async function addMemberAction(
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = createKeanggotaanSchema.parse(data);
    const result = await KeanggotaanService.addMember(validated, session.user.id);

    return {
      success: true,
      message: "Anggota berhasil ditambahkan",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan anggota",
    };
  }
}

export async function addMemberByEmailAction(
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = createKeanggotaanByEmailSchema.parse(data);
    const result = await KeanggotaanService.addMemberByEmail(validated, session.user.id);

    return {
      success: true,
      message: "Anggota berhasil ditambahkan",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan anggota",
    };
  }
}

export async function removeMemberAction(id: string): Promise<ApiResponse<null>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    await KeanggotaanService.removeMember(id);

    return {
      success: true,
      message: "Anggota berhasil dihapus",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus anggota",
    };
  }
}

export async function updateMemberRoleAction(
  keanggotaanId: string,
  peran: PeranKeanggotaan
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const result = await KeanggotaanService.updatePeran(keanggotaanId, peran);

    return {
      success: true,
      message: "Peran anggota berhasil diperbarui",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui peran anggota",
    };
  }
}

export async function searchUsersForAddingAction(
  query: string,
  organisasiId: string
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const result = await UserSearchService.searchUsersForOrganisasi(
      query,
      organisasiId,
      15
    );

    return {
      success: true,
      message: "Pencarian user berhasil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencari user",
    };
  }
}

export async function getOrganizationMembersAction(
  organisasiId: string
): Promise<ApiResponse<any>> {
  try {
    const result = await KeanggotaanService.getOrganizationMembers(organisasiId);
    return {
      success: true,
      message: "Daftar anggota berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil daftar anggota",
    };
  }
}

/**
 * ===== RIWAYAT PIMPINAN ACTIONS =====
 */

export async function assignLeaderAction(
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = createRiwayatPimpinanSchema.parse(data);
    const result = await RiwayatPimpinanService.assignLeader(
      validated,
      session.user.id
    );

    return {
      success: true,
      message: "Pimpinan berhasil ditugaskan",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menugaskan pimpinan",
    };
  }
}

export async function getActiveLeaderAction(
  organisasiId: string
): Promise<ApiResponse<any>> {
  try {
    const result = await RiwayatPimpinanService.getActiveLeader(organisasiId);
    return {
      success: true,
      message: "Data pimpinan aktif berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data pimpinan",
    };
  }
}

export async function getLeadershipHistoryAction(
  organisasiId: string
): Promise<ApiResponse<any>> {
  try {
    const result = await RiwayatPimpinanService.getLeadershipHistory(
      organisasiId
    );
    return {
      success: true,
      message: "Riwayat pimpinan berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil riwayat pimpinan",
    };
  }
}

/**
 * ===== PROFIL ACTIONS =====
 */

export async function createProfilAction(
  data: unknown
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const validated = createProfilSchema.parse(data);
    const result = await ProfilService.createProfile(validated, session.user.id);

    return {
      success: true,
      message: "Profil berhasil dibuat",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membuat profil",
    };
  }
}

export async function switchProfilAction(
  profilId: string
): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const result = await ProfilService.switchProfile(session.user.id, profilId);

    return {
      success: true,
      message: "Profil berhasil diaktifkan",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengubah profil",
    };
  }
}

export async function getUserProfilesAction(): Promise<ApiResponse<any>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Tidak terautentikasi" };
    }

    const result = await ProfilService.getUserProfiles(session.user.id);

    return {
      success: true,
      message: "Profil pengguna berhasil diambil",
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil profil",
    };
  }
}

