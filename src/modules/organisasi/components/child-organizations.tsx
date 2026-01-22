"use client";

/**
 * Child Organizations Component
 * Menampilkan sub-organisasi dan opsi untuk menambah sub-organisasi baru
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  ChevronRight,
  Building2,
  Users,
  Calendar,
  Info,
} from "lucide-react";
import { getChildOrganisasiAction } from "@/modules/organisasi/actions";
import { OrganizationFormImproved } from "./organization-form-improved";
import type { OrganisasiDTO } from "../types";
import Link from "next/link";

interface ChildOrganizationsProps {
  parentOrganisasi: OrganisasiDTO;
  onSuccess?: () => void;
}

export function ChildOrganizations({
  parentOrganisasi,
  onSuccess,
}: ChildOrganizationsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch child organizations
  const { data: children, isLoading, refetch } = useQuery({
    queryKey: ["child-organisasi", parentOrganisasi.id],
    queryFn: async () => {
      const result = await getChildOrganisasiAction(parentOrganisasi.id);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
  });

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refetch();
    onSuccess?.();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AKTIF":
        return "default";
      case "NON_AKTIF":
        return "secondary";
      case "DIBUBARKAN":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sub-Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Sub-Organisasi
                {children && children.length > 0 && (
                  <Badge variant="secondary">{children.length}</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Organisasi yang berada di bawah struktur "{parentOrganisasi.nama}"
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Sub-Organisasi</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!children || children.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Belum ada sub-organisasi. Klik tombol "Tambah Sub-Organisasi" untuk membuat
                unit baru di bawah organisasi ini.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Organisasi</TableHead>
                    <TableHead className="hidden sm:table-cell">Singkatan</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {children.map((child: OrganisasiDTO) => (
                    <TableRow key={child.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/organisasi/${child.id}`}
                          className="flex items-center gap-2 text-primary hover:underline group"
                        >
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{child.nama}</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {child.singkatan || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={getStatusBadgeVariant(child.status)}>
                          {child.status === "AKTIF" && "Aktif"}
                          {child.status === "NON_AKTIF" && "Nonaktif"}
                          {child.status === "DIBUBARKAN" && "Dibubarkan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/organisasi/${child.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Lihat Detail →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Sub-Organisasi Dialog */}
      <OrganizationFormImproved
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
        parentOrganisasi={parentOrganisasi}
        mode="sub"
      />
    </>
  );
}
