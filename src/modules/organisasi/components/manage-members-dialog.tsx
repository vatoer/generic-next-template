"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getOrganizationMembersAction,
  addMemberByEmailAction,
  removeMemberAction,
  updateMemberRoleAction,
  searchUsersForAddingAction,
} from "../actions";
import type { PeranKeanggotaan } from "../types";
import { UserPlus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisasiId: string;
  organisasiNama?: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const peranOptions: { value: PeranKeanggotaan; label: string }[] = [
  { value: "ANGGOTA", label: "Anggota" },
  { value: "PEJABAT", label: "Pejabat" },
  { value: "PLT", label: "Plt" },
  { value: "PLH", label: "Plh" },
  { value: "ADMIN", label: "Admin" },
];

export function ManageMembersDialog({
  open,
  onOpenChange,
  organisasiId,
  organisasiNama,
}: ManageMembersDialogProps) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [peran, setPeran] = useState<PeranKeanggotaan>("ANGGOTA");
  const [catatan, setCatatan] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  // Members list
  const { data, isLoading } = useQuery({
    queryKey: ["organization-members", organisasiId],
    queryFn: async () => {
      const res = await getOrganizationMembersAction(organisasiId);
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
    enabled: open,
  });

  // Search users
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search-users", organisasiId, searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 1) return [];
      const res = await searchUsersForAddingAction(searchQuery, organisasiId);
      if (!res.success) return [];
      return res.data || [];
    },
    enabled: open && searchQuery.length > 0,
  });

  const refetchMembers = () =>
    queryClient.invalidateQueries({ queryKey: ["organization-members", organisasiId] });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("Pilih user terlebih dahulu");
      const res = await addMemberByEmailAction({
        organisasiId,
        email: selectedUser.email,
        peran,
        catatan,
      });
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      setSelectedUser(null);
      setSearchQuery("");
      setCatatan("");
      setPeran("ANGGOTA");
      setUserPopoverOpen(false);
      refetchMembers();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (keanggotaanId: string) => {
      const res = await removeMemberAction(keanggotaanId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => refetchMembers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      keanggotaanId,
      peran,
    }: {
      keanggotaanId: string;
      peran: PeranKeanggotaan;
    }) => {
      const res = await updateMemberRoleAction(keanggotaanId, peran);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => refetchMembers(),
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Kelola Anggota</DialogTitle>
          <DialogDescription>
            Organisasi: {organisasiNama || organisasiId}
          </DialogDescription>
        </DialogHeader>

        {/* Add Member Section */}
        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserPlus className="h-4 w-4" />
            Tambah Anggota
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* User Search */}
            <div className="space-y-1">
              <Label>Cari User</Label>
              <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userPopoverOpen}
                    className="w-full justify-between h-10"
                    disabled={addMutation.isPending}
                  >
                    {selectedUser ? (
                      <div className="flex items-center gap-2 truncate">
                        <Avatar className="h-5 w-5 flex-shrink-0">
                          <AvatarImage src={selectedUser.image || ""} />
                          <AvatarFallback className="text-xs">
                            {getInitials(selectedUser.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{selectedUser.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pilih user...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Cari nama atau email..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>
                      {isSearching
                        ? "Mencari..."
                        : searchQuery
                        ? "User tidak ditemukan"
                        : "Ketik untuk mencari user"}
                    </CommandEmpty>
                    {searchResults && searchResults.length > 0 && (
                      <CommandGroup>
                        {(searchResults as UserSearchResult[]).map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              setSelectedUser(user);
                              setUserPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Peran */}
            <div className="space-y-1">
              <Label>Peran</Label>
              <Select
                value={peran}
                onValueChange={(v) => setPeran(v as PeranKeanggotaan)}
                disabled={addMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih peran" />
                </SelectTrigger>
                <SelectContent>
                  {peranOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Catatan */}
            <div className="space-y-1">
              <Label htmlFor="catatan">Catatan (opsional)</Label>
              <Input
                id="catatan"
                placeholder="Keterangan singkat"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={addMutation.isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setSearchQuery("");
              }}
              disabled={addMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!selectedUser || addMutation.isPending}
            >
              {addMutation.isPending ? "Menambahkan..." : "Tambah"}
            </Button>
          </div>
        </div>

        {/* Members Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Anggota Aktif</p>
            <Badge variant="secondary">{data?.length || 0}</Badge>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <ScrollArea className="max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.image} />
                            <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{member.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.peran}
                          onValueChange={(v) =>
                            updateRoleMutation.mutate({
                              keanggotaanId: member.id,
                              peran: v as PeranKeanggotaan,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {peranOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeMutation.mutate(member.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
              Belum ada anggota. Tambahkan anggota menggunakan pencarian di atas.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
