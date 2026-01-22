"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganisasiTreeAction } from "@/modules/organisasi/actions";
import {
  OrganizationTree,
  OrganizationDashboard,
  OrganizationFormImproved,
} from "@/modules/organisasi/components";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganisasiWithTree } from "@/modules/organisasi/types";

export default function OrganisasiPage() {
  const [selectedOrganisasi, setSelectedOrganisasi] =
    useState<OrganisasiWithTree | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false); // root org
  const [showCreateSub, setShowCreateSub] = useState(false); // sub org
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch organisation tree
  const { data: treeResponse, isLoading } = useQuery({
    queryKey: ["organisasi-tree", refreshKey],
    queryFn: async () => {
      const result = await getOrganisasiTreeAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const handleSelectOrganisasi = useCallback((org: OrganisasiWithTree) => {
    setSelectedOrganisasi(org);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
    setSelectedOrganisasi(null);
  }, []);

  const handleTreeRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Organisasi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola struktur organisasi dan hierarki unit
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateSub(true)}
            className="gap-2"
            disabled={!selectedOrganisasi}
          >
            <Plus className="h-4 w-4" />
            Tambah Sub-Organisasi
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="gap-2"
          >
            <Plus />
            Tambah Organisasi
          </Button>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <OrganizationFormImproved
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showCreateSub && selectedOrganisasi && (
        <OrganizationFormImproved
          open={showCreateSub}
          onOpenChange={setShowCreateSub}
          onSuccess={handleCreateSuccess}
          parentOrganisasi={selectedOrganisasi}
          mode="sub"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left: Tree View */}
        <div className="lg:col-span-1 border rounded-lg p-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : treeResponse && treeResponse.length > 0 ? (
            <OrganizationTree
              tree={treeResponse}
              onSelectOrganization={handleSelectOrganisasi}
              selectedId={selectedOrganisasi?.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-sm text-muted-foreground">
                Belum ada organisasi
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Organisasi Baru
              </Button>
            </div>
          )}
        </div>

        {/* Right: Dashboard Detail */}
        <div className="lg:col-span-2">
          {selectedOrganisasi ? (
            <OrganizationDashboard
              organisasi={selectedOrganisasi}
              onRefresh={handleTreeRefresh}
            />
          ) : (
            <div className="border rounded-lg p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pilih organisasi dari daftar di sebelah kiri untuk melihat
                  detail
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
