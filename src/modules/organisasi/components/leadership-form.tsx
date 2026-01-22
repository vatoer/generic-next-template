"use client";

/**
 * Leadership Assignment Form Component
 * Form untuk menugaskan pimpinan (DEFINITIF/PLT/PLH)
 * dengan mekanisme suksesi otomatis
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createRiwayatPimpinanSchema, type CreateRiwayatPimpinanInput } from "../schemas";
import { assignLeaderAction, getOrganizationMembersAction, getActiveLeaderAction } from "../actions";
import type { OrganisasiDTO, PimpinanAktifDTO } from "../types";

interface LeadershipFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisasi: OrganisasiDTO;
  onSuccess?: () => void;
}

export function LeadershipForm({
  open,
  onOpenChange,
  organisasi,
  onSuccess,
}: LeadershipFormProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [activeLeader, setActiveLeader] = useState<PimpinanAktifDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateRiwayatPimpinanInput>({
    resolver: zodResolver(createRiwayatPimpinanSchema),
    defaultValues: {
      organisasiId: organisasi.id,
      tipeKepemimpinan: "DEFINITIF",
    },
  });

  // Load members dan pimpinan aktif saat form dibuka
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [membersRes, leaderRes] = await Promise.all([
          getOrganizationMembersAction(organisasi.id),
          getActiveLeaderAction(organisasi.id),
        ]);

        if (membersRes.success && membersRes.data) {
          setMembers(membersRes.data);
        }
        if (leaderRes.success && leaderRes.data) {
          setActiveLeader(leaderRes.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, organisasi.id]);

  const onSubmit = async (data: CreateRiwayatPimpinanInput) => {
    setIsSubmitting(true);
    try {
      const result = await assignLeaderAction(data);

      if (result.success) {
        onSuccess?.();
        reset();
        onOpenChange(false);
      } else {
        alert(result.message || "Gagal menugaskan pimpinan");
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
          <DialogTitle>Tugaskan Pimpinan</DialogTitle>
          <DialogDescription>
            Organisasi: <strong>{organisasi.nama}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Alert: Pimpinan Aktif */}
        {activeLeader && (
          <Alert>
            <AlertDescription className="text-sm">
              <div className="font-medium mb-1">Pimpinan Aktif Saat Ini:</div>
              <div className="ml-2 space-y-0.5">
                <div>
                  Nama: <strong>{activeLeader.nama}</strong>
                </div>
                <div>
                  Tipe:{" "}
                  <Badge variant="outline" className="text-xs">
                    {activeLeader.tipeKepemimpinan}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Sejak: {new Date(activeLeader.tanggalMulai).toLocaleDateString("id-ID")}
                </div>
              </div>
              <div className="mt-2 text-xs text-amber-600">
                ℹ️ Jika Anda menugaskan pimpinan baru, pimpinan lama akan otomatis
                berhenti
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipe Kepemimpinan */}
          <div className="space-y-2">
            <Label htmlFor="tipeKepemimpinan">Jenis Kepemimpinan</Label>
            <Select
              defaultValue="DEFINITIF"
              {...register("tipeKepemimpinan")}
              onValueChange={(value: any) =>
                register("tipeKepemimpinan").onChange({ target: { value } })
              }
            >
              <SelectTrigger id="tipeKepemimpinan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEFINITIF">
                  Definit if (Pejabat Tetap)
                </SelectItem>
                <SelectItem value="PLT">
                  PLT (Pelaksana Tugas - Berhalangan Tetap)
                </SelectItem>
                <SelectItem value="PLH">
                  PLH (Pelaksana Harian - Berhalangan Sementara)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tipeKepemimpinan && (
              <p className="text-sm text-destructive">
                {errors.tipeKepemimpinan.message}
              </p>
            )}
          </div>

          {/* Anggota */}
          <div className="space-y-2">
            <Label htmlFor="keanggotaanId">Pilih Anggota</Label>
            <Select
              {...register("keanggotaanId")}
              onValueChange={(value: any) =>
                register("keanggotaanId").onChange({ target: { value } })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="keanggotaanId">
                <SelectValue placeholder="Pilih anggota organisasi" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.user.name} - {member.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.keanggotaanId && (
              <p className="text-sm text-destructive">
                {errors.keanggotaanId.message}
              </p>
            )}
          </div>

          {/* Alasan */}
          <div className="space-y-2">
            <Label htmlFor="alasan">
              Alasan/Catatan (opsional)
            </Label>
            <Textarea
              id="alasan"
              placeholder="Contoh: Pejabat sebelumnya pensiun / Alasan pergantian"
              {...register("alasan")}
              className="h-24"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Menyimpan..." : "Tugaskan Pimpinan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
