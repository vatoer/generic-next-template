"use client";

/**
 * Organization Form Component
 * Form untuk membuat/edit organisasi
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { createOrganisasiSchema, type CreateOrganisasiInput } from "../schemas";
import { createOrganisasiAction } from "../actions";
import type { OrganisasiDTO } from "../types";

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (org: OrganisasiDTO) => void;
  parentOrganisasi?: OrganisasiDTO;
  existingOrganizations?: OrganisasiDTO[];
}

export function OrganizationForm({
  open,
  onOpenChange,
  onSuccess,
  parentOrganisasi,
  existingOrganizations = [],
}: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateOrganisasiInput>({
    resolver: zodResolver(createOrganisasiSchema),
    defaultValues: {
      jenis: "STRUKTURAL",
      punyaAnggaran: false,
      indukOrganisasiId: parentOrganisasi?.id,
    },
  });

  const onSubmit = async (data: CreateOrganisasiInput) => {
    setIsSubmitting(true);
    try {
      const result = await createOrganisasiAction(data);

      if (result.success && result.data) {
        onSuccess?.(result.data);
        reset();
        onOpenChange(false);
      } else {
        alert(result.message || "Gagal membuat organisasi");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {parentOrganisasi
              ? `Buat Sub-Organisasi dari "${parentOrganisasi.nama}"`
              : "Buat Organisasi Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Organisasi</Label>
            <Input
              id="nama"
              placeholder="Contoh: Direktorat Keuangan"
              {...register("nama")}
            />
            {errors.nama && (
              <p className="text-sm text-destructive">{errors.nama.message}</p>
            )}
          </div>

          {/* Singkatan */}
          <div className="space-y-2">
            <Label htmlFor="singkatan">Singkatan (opsional)</Label>
            <Input
              id="singkatan"
              placeholder="Contoh: DK"
              {...register("singkatan")}
            />
          </div>

          {/* Jenis */}
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis Organisasi</Label>
            <Select
              defaultValue="STRUKTURAL"
              {...register("jenis")}
              onValueChange={(value: any) => register("jenis").onChange({ target: { value } })}
            >
              <SelectTrigger id="jenis">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRUKTURAL">Struktural</SelectItem>
                <SelectItem value="KELOMPOK_KERJA">Kelompok Kerja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Eselon */}
          <div className="space-y-2">
            <Label htmlFor="eselon">Eselon (opsional)</Label>
            <Input
              id="eselon"
              type="number"
              placeholder="1, 2, 3, ..."
              {...register("eselon", { valueAsNumber: true })}
            />
          </div>

          {/* Punya Anggaran */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="punyaAnggaran"
              {...register("punyaAnggaran")}
            />
            <Label htmlFor="punyaAnggaran" className="font-normal cursor-pointer">
              Organisasi ini memiliki anggaran
            </Label>
          </div>

          {/* Induk Organisasi */}
          {!parentOrganisasi && existingOrganizations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="induk">Induk Organisasi (opsional)</Label>
              <Select
                {...register("indukOrganisasiId")}
                onValueChange={(value: any) =>
                  register("indukOrganisasiId").onChange({ target: { value: value || null } })
                }
              >
                <SelectTrigger id="induk">
                  <SelectValue placeholder="Pilih induk organisasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada (Top level)</SelectItem>
                  {existingOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
