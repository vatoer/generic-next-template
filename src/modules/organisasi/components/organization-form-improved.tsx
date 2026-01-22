"use client";

/**
 * Organization Form Component (Improved)
 * Form untuk membuat/edit organisasi dengan searchable parent organization
 * Support: Root organization + Sub-organization dengan hierarchy
 */

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ChevronsUpDown, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createOrganisasiSchema, type CreateOrganisasiInput } from "../schemas";
import { createOrganisasiAction, getParentOrganisasiListAction } from "../actions";
import type { OrganisasiDTO } from "../types";

interface OrganizationFormImprovedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (org: OrganisasiDTO) => void;
  parentOrganisasi?: OrganisasiDTO;
  mode?: "root" | "sub"; // "root" = new root org, "sub" = sub org dari parent
}

export function OrganizationFormImproved({
  open,
  onOpenChange,
  onSuccess,
  parentOrganisasi,
  mode = "root",
}: OrganizationFormImprovedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [parentList, setParentList] = useState<OrganisasiDTO[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [selectedParent, setSelectedParent] = useState<OrganisasiDTO | null>(
    parentOrganisasi || null
  );
  const [searchParent, setSearchParent] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<CreateOrganisasiInput>({
    resolver: zodResolver(createOrganisasiSchema),
    defaultValues: {
      jenis: "STRUKTURAL",
      status: "AKTIF",
      punyaAnggaran: false,
      indukOrganisasiId: parentOrganisasi?.id,
    },
  });

  // Load parent organizations list
  useEffect(() => {
    if (open && !parentOrganisasi) {
      loadParentOrganisasi();
    }
  }, [open, parentOrganisasi]);

  const loadParentOrganisasi = async () => {
    setIsLoadingParents(true);
    try {
      const result = await getParentOrganisasiListAction();
      if (result.success && result.data) {
        setParentList(result.data);
      }
    } catch (error) {
      console.error("Gagal load parent organisasi:", error);
    } finally {
      setIsLoadingParents(false);
    }
  };

  // Filter parent list berdasarkan search
  const filteredParents = useMemo(() => {
    if (!searchParent) return parentList;
    const search = searchParent.toLowerCase();
    return parentList.filter(
      (org) =>
        org.nama.toLowerCase().includes(search) ||
        org.singkatan?.toLowerCase().includes(search)
    );
  }, [parentList, searchParent]);

  const onSubmit = async (data: CreateOrganisasiInput) => {
    setIsSubmitting(true);
    try {
      // Tambahkan parent ID jika sudah dipilih
      const finalData = {
        ...data,
        indukOrganisasiId: selectedParent?.id || data.indukOrganisasiId,
      };

      const result = await createOrganisasiAction(finalData);

      if (result.success && result.data) {
        onSuccess?.(result.data);
        reset();
        setSelectedParent(null);
        setSearchParent("");
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

  const handleParentSelect = (org: OrganisasiDTO) => {
    setSelectedParent(org);
    setParentOpen(false);
    setSearchParent("");
  };

  const dialogTitle = parentOrganisasi
    ? `Buat Sub-Organisasi dari "${parentOrganisasi.nama}"`
    : selectedParent
    ? `Buat Sub-Organisasi dari "${selectedParent.nama}"`
    : "Buat Organisasi Baru";

  const dialogDescription = parentOrganisasi || selectedParent
    ? "Organisasi ini akan menjadi sub-unit dari organisasi induk yang dipilih"
    : "Organisasi baru tanpa induk (Level Tertinggi)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Alert: Sub-Organisasi Mode */}
          {(parentOrganisasi || selectedParent) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <span className="font-medium">Induk Organisasi: </span>
                {parentOrganisasi?.nama || selectedParent?.nama}
              </AlertDescription>
            </Alert>
          )}

          {/* Nama Organisasi */}
          <div className="space-y-2">
            <Label htmlFor="nama" className="font-semibold">
              Nama Organisasi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nama"
              placeholder="Contoh: Direktorat Surveilans dan Imunisasi"
              {...register("nama")}
              disabled={isSubmitting}
            />
            {errors.nama && (
              <p className="text-sm text-destructive">{errors.nama.message}</p>
            )}
          </div>

          {/* Singkatan */}
          <div className="space-y-2">
            <Label htmlFor="singkatan" className="font-semibold">
              Singkatan <span className="text-muted-foreground">(Opsional)</span>
            </Label>
            <Input
              id="singkatan"
              placeholder="Contoh: DSI"
              {...register("singkatan")}
              disabled={isSubmitting}
            />
          </div>

          {/* Grid: Jenis & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Jenis Organisasi */}
            <div className="space-y-2">
              <Label htmlFor="jenis" className="font-semibold">
                Jenis <span className="text-destructive">*</span>
              </Label>
              <Select
                defaultValue="STRUKTURAL"
                onValueChange={(value) =>
                  register("jenis").onChange({ target: { value } })
                }
              >
                <SelectTrigger id="jenis" disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRUKTURAL">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Struktural
                    </span>
                  </SelectItem>
                  <SelectItem value="KELOMPOK_KERJA">
                    <span>Kelompok Kerja</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                defaultValue="AKTIF"
                onValueChange={(value) =>
                  register("status").onChange({ target: { value } })
                }
              >
                <SelectTrigger id="status" disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="NON_AKTIF">Nonaktif</SelectItem>
                  <SelectItem value="DIBUBARKAN">Dibubarkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid: Eselon & Anggaran */}
          <div className="grid grid-cols-2 gap-4">
            {/* Eselon */}
            <div className="space-y-2">
              <Label htmlFor="eselon" className="font-semibold">
                Eselon <span className="text-muted-foreground">(Opsional)</span>
              </Label>
              <Input
                id="eselon"
                type="number"
                placeholder="1, 2, 3, ..."
                {...register("eselon", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            {/* Punya Anggaran */}
            <div className="space-y-2">
              <Label className="font-semibold">Anggaran</Label>
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-background">
                <Checkbox
                  id="punyaAnggaran"
                  {...register("punyaAnggaran")}
                  disabled={isSubmitting}
                />
                <Label htmlFor="punyaAnggaran" className="font-normal cursor-pointer flex-1">
                  Memiliki Anggaran
                </Label>
              </div>
            </div>
          </div>

          {/* Induk Organisasi - Searchable Select */}
          {!parentOrganisasi && (
            <div className="space-y-2">
              <Label className="font-semibold">
                Induk Organisasi{" "}
                <span className="text-muted-foreground">(Opsional)</span>
              </Label>

              <Popover open={parentOpen} onOpenChange={setParentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={parentOpen}
                    className="w-full justify-between h-10"
                    disabled={isSubmitting || isLoadingParents}
                  >
                    {selectedParent ? (
                      <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{selectedParent.nama}</span>
                        {selectedParent.singkatan && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            {selectedParent.singkatan}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {isLoadingParents ? "Memuat..." : "Pilih Induk Organisasi"}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari organisasi..."
                      value={searchParent}
                      onValueChange={setSearchParent}
                    />
                    <CommandEmpty>
                      {isLoadingParents
                        ? "Memuat..."
                        : "Organisasi tidak ditemukan."}
                    </CommandEmpty>
                    <CommandGroup heading="Organisasi Tersedia">
                      {filteredParents.map((org) => (
                        <CommandItem
                          key={org.id}
                          value={org.id}
                          onSelect={() => handleParentSelect(org)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedParent?.id === org.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Building2 className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{org.nama}</div>
                            {org.singkatan && (
                              <div className="text-xs text-muted-foreground">
                                {org.singkatan}
                              </div>
                            )}
                          </div>
                          {org.jenis === "KELOMPOK_KERJA" && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Pokja
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              <p className="text-xs text-muted-foreground">
                Kosongkan jika organisasi ini tidak memiliki induk (level tertinggi)
              </p>

              {selectedParent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedParent(null)}
                  className="text-xs h-8"
                >
                  Batal pilih induk organisasi
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
                setSelectedParent(null);
                setSearchParent("");
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Organisasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
