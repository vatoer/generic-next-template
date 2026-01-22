# Organisasi Module - Dokumentasi Lengkap

## 📋 Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Struktur Data](#struktur-data)
3. [Services Layer](#services-layer)
4. [Server Actions](#server-actions)
5. [UI Components](#ui-components)
6. [Implementasi](#implementasi)
7. [Contoh Penggunaan](#contoh-penggunaan)

---

## Gambaran Umum

Organisasi Module adalah sistem manajemen organisasi yang komprehensif untuk struktur organisasi pemerintahan/perusahaan dengan fitur:

✅ **Manajemen Organisasi** - CRUD, hierarki, tree view  
✅ **Manajemen Keanggotaan** - Tambah/hapus anggota, kelola peran  
✅ **Manajemen Kepemimpinan** - Penugasan pimpinan dengan suksesi otomatis (DEFINITIF/PLT/PLH)  
✅ **Multi-Profile** - Setiap user bisa punya banyak profil dengan peran berbeda  
✅ **Profile Switcher** - Switch antar profil di navbar  

---

## Struktur Data

### Organisasi
```prisma
model Organisasi {
  id            String                 @id @default(cuid())
  nama          String
  singkatan     String?
  status        StatusOrganisasi      // AKTIF, NON_AKTIF, DIBUBARKAN
  jenis         JenisOrganisasi       // STRUKTURAL, KELOMPOK_KERJA
  eselon        Int?
  punyaAnggaran Boolean
  
  // Hierarki
  indukOrganisasiId String?
  indukOrganisasi   Organisasi?
  subOrganisasi     Organisasi[]
  
  // Relasi
  daftarAnggota     Keanggotaan[]
  daftarPimpinan    RiwayatPimpinan[]
  
  // Metadata
  createdAt DateTime
  createdBy String
  updatedAt DateTime?
  updatedBy String?
}
```

### Keanggotaan (User ➜ Organisasi)
```prisma
model Keanggotaan {
  id             String           @id
  organisasiId   String
  userId         String
  peran          PeranKeanggotaan // ANGGOTA, PEJABAT, PLT, PLH, ADMIN
  tanggalMulai   DateTime
  tanggalSelesai DateTime?
  aktif          Boolean
  
  organisasi     Organisasi
  user           User
  riwayatJabatan RiwayatPimpinan[]
}
```

### RiwayatPimpinan (Kepemimpinan + Suksesi)
```prisma
model RiwayatPimpinan {
  id               String           @id
  organisasiId     String
  keanggotaanId    String           // Harus same user di keanggotaan
  tipeKepemimpinan TipeKepemimpinan // DEFINITIF, PLT, PLH
  tanggalMulai     DateTime
  tanggalSelesai   DateTime?
  aktif            Boolean
  alasan           String?
  
  // Suksesi tracking
  pimpinanDigantikanId String?
  pimpinanDigantikan   RiwayatPimpinan?
  penerus              RiwayatPimpinan[]
  
  organisasi  Organisasi
  keanggotaan Keanggotaan
}
```

### Profil (Multi-Profile)
```prisma
model Profil {
  id    String     @id
  userId String
  nama  String     // "Personal", "Kabid AA", "Ketua Pokja"
  tipe  TipeProfil // PERSONAL, ORGANISASI, EKSTERNAL
  isDefault Boolean
  aktif Boolean
  
  peranProfil ProfilRole[]
  dataKeanggotaan Keanggotaan?
}
```

---

## Services Layer

### 1. OrganisasiService

```typescript
import { OrganisasiService } from "@/modules/organisasi/services";

// CRUD
await OrganisasiService.create(data, createdBy);
await OrganisasiService.update(id, data, updatedBy);
await OrganisasiService.delete(id, deletedBy);
await OrganisasiService.getById(id);
await OrganisasiService.getAll(jenis?);

// Hierarki
await OrganisasiService.getTree();          // Tree structure
await OrganisasiService.getSubOrganisasi(parentId);
await OrganisasiService.getHierarchyPath(id); // Breadcrumb

// Dengan data
await OrganisasiService.getWithPimpinanAktif(id);
```

### 2. KeanggotaanService

```typescript
import { KeanggotaanService } from "@/modules/organisasi/services";

// Member Management
await KeanggotaanService.addMember(data, createdBy);
await KeanggotaanService.removeMember(id);
await KeanggotaanService.updatePeran(id, peran);
await KeanggotaanService.getOrganizationMembers(orgId);
await KeanggotaanService.getUserOrganizations(userId);
await KeanggotaanService.getMemberCount(orgId);
```

### 3. RiwayatPimpinanService

**⚠️ PENTING: Gunakan `assignLeader()` untuk suksesi otomatis!**

```typescript
import { RiwayatPimpinanService } from "@/modules/organisasi/services";

// Suksesi Otomatis (Transaction)
// 1. Cari pimpinan aktif saat ini
// 2. Update lama: aktif=false, tanggalSelesai=now
// 3. Buat baru dengan pimpinanDigantikanId
await RiwayatPimpinanService.assignLeader(data, assignedBy);

// Query
await RiwayatPimpinanService.getActiveLeader(orgId);
await RiwayatPimpinanService.getLeadershipHistory(orgId);
await RiwayatPimpinanService.getActiveLeadersByType(orgId, tipe);
await RiwayatPimpinanService.endLeadership(id);
```

### 4. ProfilService

```typescript
import { ProfilService } from "@/modules/organisasi/services";

// Profil Management
await ProfilService.createProfile(data, createdBy);
await ProfilService.updateProfile(id, data, updatedBy);
await ProfilService.deleteProfile(id, deletedBy);
await ProfilService.getUserProfiles(userId);
await ProfilService.getDefaultProfile(userId);

// Switch Profile
await ProfilService.switchProfile(userId, profilId);

// Permission
await ProfilService.getProfilePermissions(profilId);
await ProfilService.assignRoleToProfile(profilId, roleId);
```

---

## Server Actions

Semua server actions memerlukan autentikasi. Gunakan dari client components:

```typescript
import {
  createOrganisasiAction,
  updateOrganisasiAction,
  getOrganisasiTreeAction,
  addMemberAction,
  removeMemberAction,
  assignLeaderAction,
  getActiveLeaderAction,
  getLeadershipHistoryAction,
  createProfilAction,
  switchProfilAction,
  getUserProfilesAction,
} from "@/modules/organisasi/actions";

// Contoh
const result = await createOrganisasiAction({
  nama: "Direktorat Keuangan",
  singkatan: "DK",
  jenis: "STRUKTURAL",
});

if (result.success) {
  console.log("Berhasil:", result.data);
} else {
  console.error("Gagal:", result.message);
}
```

---

## UI Components

### 1. OrganizationTree

Tree view interaktif untuk hierarki organisasi.

```tsx
import { OrganizationTree } from "@/modules/organisasi/components";

<OrganizationTree
  tree={treeData}
  onSelectOrganization={(org) => setSelected(org)}
  filterKind="STRUKTURAL" // Optional: filter by jenis
  selectedId={selected?.id}
/>
```

**Props:**
- `tree: OrganisasiWithTree[]` - Data tree
- `onSelectOrganization?: (org) => void` - Callback saat org dipilih
- `filterKind?: JenisOrganisasi` - Filter STRUKTURAL/KELOMPOK_KERJA
- `selectedId?: string` - ID organisasi yang dipilih

### 2. OrganizationForm

Form untuk membuat/edit organisasi.

```tsx
import { OrganizationForm } from "@/modules/organisasi/components";

const [formOpen, setFormOpen] = useState(false);

<OrganizationForm
  open={formOpen}
  onOpenChange={setFormOpen}
  parentOrganisasi={selectedOrg}
  existingOrganizations={allOrgs}
  onSuccess={(newOrg) => {
    console.log("Organisasi baru dibuat:", newOrg);
  }}
/>
```

### 3. LeadershipForm

Form untuk menugaskan pimpinan dengan mekanisme suksesi otomatis.

```tsx
import { LeadershipForm } from "@/modules/organisasi/components";

const [leaderFormOpen, setLeaderFormOpen] = useState(false);

<LeadershipForm
  open={leaderFormOpen}
  onOpenChange={setLeaderFormOpen}
  organisasi={selectedOrganisasi}
  onSuccess={() => {
    console.log("Pimpinan ditugaskan");
  }}
/>
```

**Fitur Otomatis:**
- ✅ Tampilkan pimpinan aktif saat ini
- ✅ Jika ada pimpinan lama, akan otomatis berhenti
- ✅ Tracking suksesi via `pimpinanDigantikanId`

### 4. ProfileSwitcher

Dropdown di navbar untuk switch profil.

```tsx
import { ProfileSwitcher } from "@/modules/organisasi/components";

<ProfileSwitcher
  onProfileSwitch={(profileId) => {
    window.location.reload(); // Reload untuk update permissions
  }}
/>
```

### 5. OrganizationDashboard

Dashboard organisasi dengan info lengkap.

```tsx
import { OrganizationDashboard } from "@/modules/organisasi/components";

<OrganizationDashboard
  organisasi={selectedOrganisasi}
  onEditClick={() => setFormOpen(true)}
  onManageMembersClick={() => setMembersDialogOpen(true)}
  onManageLeadershipClick={() => setLeaderFormOpen(true)}
/>
```

Menampilkan:
- ✅ Info dasar organisasi (nama, jenis, eselon, anggota)
- ✅ Pimpinan aktif (dengan tipe: DEFINITIF/PLT/PLH)
- ✅ 5 anggota terbaru

---

## Implementasi

### 1. Tambahkan ProfileSwitcher ke Topbar

Di `src/modules/layout/components/topbar.tsx`:

```tsx
import { ProfileSwitcher } from "@/modules/organisasi/components";

export function Topbar({...}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      {/* Left */}
      <AppIdentity />
      
      {/* Right */}
      <div className="flex items-center gap-3">
        <NotificationPopover />
        <ProfileSwitcher /> {/* ← TAMBAH INI */}
        <ProfileMenu />
      </div>
    </div>
  );
}
```

### 2. Buat Pages

**a) Daftar Organisasi** - `src/app/(modules)/organisasi/page.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import { getOrganisasiTreeAction } from "@/modules/organisasi/actions";
import {
  OrganizationTree,
  OrganizationForm,
  OrganizationDashboard,
} from "@/modules/organisasi/components";

export default function OrganisasiPage() {
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    const result = await getOrganisasiTreeAction();
    if (result.success) {
      setTree(result.data);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Tree View */}
      <div className="col-span-1">
        <h3 className="font-semibold mb-4">Organisasi</h3>
        <OrganizationTree
          tree={tree}
          onSelectOrganization={setSelected}
          selectedId={selected?.id}
        />
        <button onClick={() => setFormOpen(true)} className="mt-4">
          + Organisasi Baru
        </button>
      </div>

      {/* Dashboard */}
      <div className="col-span-2">
        {selected ? (
          <OrganizationDashboard organisasi={selected} />
        ) : (
          <div className="text-muted-foreground">Pilih organisasi</div>
        )}
      </div>

      {/* Forms */}
      <OrganizationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => loadTree()}
      />
    </div>
  );
}
```

**b) Halaman Pengaturan Profil** - `src/app/(modules)/settings/profiles/page.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import { getUserProfilesAction, createProfilAction } from "@/modules/organisasi/actions";
import { ProfileSwitcher } from "@/modules/organisasi/components";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const result = await getUserProfilesAction();
    if (result.success) {
      setProfiles(result.data);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
      
      {/* Profil List */}
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="p-4 border rounded">
            <h3 className="font-medium">{profile.nama}</h3>
            <p className="text-sm text-muted-foreground">{profile.tipe}</p>
            {profile.isDefault && <span className="text-xs">Default</span>}
          </div>
        ))}
      </div>

      {/* Create Profil */}
      <button onClick={() => {/* Form untuk create */}}>
        + Tambah Profil
      </button>
    </div>
  );
}
```

---

## Contoh Penggunaan

### Flow: Membuat Organisasi & Tugaskan Pimpinan

```typescript
// 1. Buat organisasi
const orgResult = await createOrganisasiAction({
  nama: "Direktur IT",
  singkatan: "IT",
  jenis: "STRUKTURAL",
  eselon: 2,
});

if (!orgResult.success) throw new Error(orgResult.message);
const organisasiId = orgResult.data.id;

// 2. Tambah anggota
const memberResult = await addMemberAction({
  organisasiId,
  userId: "user123",
  peran: "PEJABAT",
});

if (!memberResult.success) throw new Error(memberResult.message);
const keanggotaanId = memberResult.data.id;

// 3. Tugaskan pimpinan (otomatis handle suksesi)
const leaderResult = await assignLeaderAction({
  organisasiId,
  keanggotaanId,
  tipeKepemimpinan: "DEFINITIF",
  alasan: "Penunjukan pejabat baru",
});

if (!leaderResult.success) throw new Error(leaderResult.message);
console.log("Pimpinan ditugaskan!");

// 4. Query pimpinan aktif
const activeLeader = await getActiveLeaderAction(organisasiId);
console.log("Pimpinan saat ini:", activeLeader.data);
```

---

## Best Practices

### ✅ Selalu Gunakan `assignLeader()`
Jangan buat `RiwayatPimpinan` secara langsung. Gunakan `assignLeader()` untuk handle suksesi otomatis dengan transaction.

### ✅ Validasi Session
Semua server actions sudah validate session. Pastikan user terautentikasi sebelum memanggil action.

### ✅ Error Handling
```typescript
const result = await someAction(data);
if (!result.success) {
  // Tampilkan error ke user
  toast.error(result.message);
  return;
}
// Process result.data
```

### ✅ Re-load Data Setelah Mutasi
Setelah create/update/delete, re-load data untuk konsistensi:
```typescript
const result = await createOrganisasiAction(data);
if (result.success) {
  await loadTree(); // Reload tree
}
```

---

## Troubleshooting

**Q: Pimpinan tidak otomatis berhenti saat assign pimpinan baru?**  
A: Pastikan menggunakan `assignLeaderAction()`, bukan membuat record manual.

**Q: Profile Switcher tidak muncul?**  
A: Pastikan sudah import ke Topbar dan user punya >1 profil.

**Q: Hierarki organisasi tidak muncul?**  
A: Pastikan `indukOrganisasiId` sudah di-set saat create organisasi.

---

## 📚 Referensi

- Schemas: `src/modules/organisasi/schemas.ts`
- Types: `src/modules/organisasi/types.ts`
- Services: `src/modules/organisasi/services/`
- Actions: `src/modules/organisasi/actions.ts`
- Components: `src/modules/organisasi/components/`
