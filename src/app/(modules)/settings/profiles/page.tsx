"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getUserProfilesAction,
  switchProfilAction,
  createProfilAction,
} from "@/modules/organisasi/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Plus, CheckCircle2, User, Building2, Globe, LogIn } from "lucide-react";
import { ProfilDTO } from "@/modules/organisasi/types";
import { CreateProfilForm } from "@/modules/organisasi/components/create-profil-form";

export default function ProfilesPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Fetch user profiles
  const { data: profilesResponse, isLoading, refetch } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: async () => {
      const result = await getUserProfilesAction();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  const profiles = profilesResponse?.profiles || [];
  const currentProfileId = profilesResponse?.currentProfileId;

  useEffect(() => {
    if (currentProfileId && !selectedProfileId) {
      setSelectedProfileId(currentProfileId);
    }
  }, [currentProfileId]);

  const handleSwitchProfile = async (profileId: string) => {
    if (profileId === selectedProfileId) return;
    
    setIsSwitching(true);
    const result = await switchProfilAction(profileId);
    if (result.success) {
      setSelectedProfileId(profileId);
      // Reload page after profile switch
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      setIsSwitching(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileIcon = (tipe: string) => {
    switch (tipe) {
      case "PERSONAL":
        return <User className="h-5 w-5" />;
      case "ORGANISASI":
        return <Building2 className="h-5 w-5" />;
      case "EKSTERNAL":
        return <Globe className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getProfileTypeLabel = (tipe: string) => {
    switch (tipe) {
      case "PERSONAL":
        return "Pribadi";
      case "ORGANISASI":
        return "Organisasi";
      case "EKSTERNAL":
        return "Eksternal";
      default:
        return tipe;
    }
  };

  const getProfileTypeColor = (tipe: string) => {
    switch (tipe) {
      case "PERSONAL":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "ORGANISASI":
        return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800";
      case "EKSTERNAL":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800";
      default:
        return "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Profil</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola profil dan konteks organisasi Anda dengan mudah
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Profil Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Profil Baru</DialogTitle>
              <DialogDescription>
                Tambahkan profil baru untuk mengakses konteks organisasi yang berbeda
              </DialogDescription>
            </DialogHeader>
            <CreateProfilForm onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Profile Highlight */}
      {selectedProfileId && profiles.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage
                  src={profiles.find((p: ProfilDTO) => p.id === selectedProfileId)?.avatar}
                  alt=""
                />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(
                    profiles.find((p: ProfilDTO) => p.id === selectedProfileId)?.nama || ""
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Profil Aktif Saat Ini
                </p>
                <p className="text-lg font-semibold truncate">
                  {profiles.find((p: ProfilDTO) => p.id === selectedProfileId)?.nama}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile: ProfilDTO) => {
            const isActive = selectedProfileId === profile.id;
            return (
              <Card
                key={profile.id}
                className={`overflow-hidden transition-all cursor-pointer hover:shadow-md border-2 ${
                  isActive
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-primary/20"
                } ${getProfileTypeColor(profile.tipe)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={profile.avatar ?? undefined}
                          alt={profile.nama}
                        />
                        <AvatarFallback className="font-semibold">
                          {getInitials(profile.nama)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {profile.nama}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {getProfileTypeLabel(profile.tipe)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getProfileIcon(profile.tipe)}
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-3 space-y-3">
                  {/* Profile Info */}
                  <div className="space-y-2">
                    {profile.organisasi && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Organisasi:</span>
                        <span className="font-medium truncate">
                          {profile.organisasi.nama}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={profile.aktif ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {profile.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSwitchProfile(profile.id)}
                    disabled={isActive || isSwitching}
                    variant={isActive ? "default" : "outline"}
                    className="w-full"
                    size="sm"
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Profil Aktif
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Gunakan Profil
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Belum ada profil dibuat
            </p>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Profil Pertama
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Profil Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan profil untuk memulai
                  </DialogDescription>
                </DialogHeader>
                <CreateProfilForm onSuccess={handleCreateSuccess} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Tentang Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3 text-blue-900 dark:text-blue-100">
          <p>
            Profil memungkinkan Anda mengelola multiple konteks dalam sistem.
          </p>
          <div className="space-y-2">
            <p className="font-medium">Setiap profil dapat memiliki:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Role dan permission berbeda</li>
              <li>Konteks organisasi yang berbeda</li>
              <li>Dashboard yang disesuaikan</li>
            </ul>
          </div>
          <p className="text-xs pt-2 border-t border-blue-200 dark:border-blue-700">
            💡 Gunakan tombol "Gunakan Profil" untuk beralih antar profil dengan mudah.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
