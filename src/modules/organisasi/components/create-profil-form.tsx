"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProfilSchema } from "@/modules/organisasi/schemas";
import { createProfilAction } from "@/modules/organisasi/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getOrganisasiListAction } from "@/modules/organisasi/actions";

interface CreateProfilFormProps {
  onSuccess?: () => void;
}

export function CreateProfilForm({ onSuccess }: CreateProfilFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(createProfilSchema),
    defaultValues: {
      nama: "",
      deskripsi: "",
      tipe: "PERSONAL",
      organisasiId: undefined,
    },
  });

  // Fetch organizations for selection
  const { data: orgsResponse } = useQuery({
    queryKey: ["organisasi-list"],
    queryFn: async () => {
      const result = await getOrganisasiListAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createProfilAction({
        ...data,
        organisasiId: data.organisasiId || null,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      form.reset();
      onSuccess?.();
    } catch (err) {
      setError("Terjadi kesalahan saat membuat profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Profil</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama profil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan deskripsi profil (opsional)"
                  {...field}
                />
              </FormControl>
              <FormDescription>Jelaskan tujuan profil ini</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Profil</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="ORGANISASI">Organisasi</SelectItem>
                  <SelectItem value="EKSTERNAL">Eksternal</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih tipe profil sesuai dengan kebutuhan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organisasiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisasi (Opsional)</FormLabel>
              <Select
                value={field.value || ""}
                onValueChange={(value) => field.onChange(value || null)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih organisasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Tidak ada organisasi</SelectItem>
                  {orgsResponse?.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih organisasi untuk profil ini
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Membuat Profil..." : "Buat Profil"}
        </Button>
      </form>
    </Form>
  );
}
