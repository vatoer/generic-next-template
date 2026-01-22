"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrganisasiAction, getActiveLeaderAction } from "@/modules/organisasi/actions";
import {
  OrganizationDashboard,
  ChildOrganizations,
  OrganizationFormImproved,
} from "@/modules/organisasi/components";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function OrganisasiDetailPage() {
  const [showSubDialog, setShowSubDialog] = useState(false);
  const router = useRouter();
  const params = useParams();
  const organisasiId = params.id as string;

  const { data: organisasi, isLoading: orgLoading } = useQuery({
    queryKey: ["organisasi", organisasiId],
    queryFn: async () => {
      const result = await getOrganisasiAction(organisasiId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const { data: leader } = useQuery({
    queryKey: ["organisasi-leader", organisasiId],
    queryFn: async () => {
      const result = await getActiveLeaderAction(organisasiId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const handleBack = () => {
    router.back();
  };

  if (orgLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!organisasi) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Organisasi tidak ditemukan</p>
        <Button onClick={handleBack} variant="outline">
          Kembali
        </Button>

          {/* Child Organizations */}
          <ChildOrganizations
            parentOrganisasi={organisasi}
            onSuccess={() => {
              // TODO: ideally refetch organisasi detail if needed
            }}
          />

          {/* Create Sub-Organisasi Dialog */}
          <OrganizationFormImproved
            open={showSubDialog}
            onOpenChange={setShowSubDialog}
            parentOrganisasi={organisasi}
            mode="sub"
          />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{organisasi.nama}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {organisasi.deskripsi}
          </p>
        </div>
      </div>

      {/* Dashboard */}
      <OrganizationDashboard
        organisasi={organisasi}
        onRefresh={() => {
          // Refresh data if needed
        }}
      />
    </div>
  );
}
