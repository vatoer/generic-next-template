"use client";

/**
 * Profile Switcher Component
 * Menampilkan daftar profil user dan memungkinkan switch antar profil
 * Best practice: Clean design, responsive, accessible
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Plus, User, Building2, Globe } from "lucide-react";
import { getUserProfilesAction, switchProfilAction } from "../actions";
import type { ProfilDTO } from "../types";

interface ProfileSwitcherProps {
  currentProfileId?: string;
  onProfileSwitch?: (profileId: string) => void;
}

export function ProfileSwitcher({
  currentProfileId,
  onProfileSwitch,
}: ProfileSwitcherProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Load profil saat komponen mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfilesAction();
      if (result.success && result.data) {
        setProfiles(result.data);
        // Set profil default atau yang pertama
        const defaultProfile = result.data.find((p: any) => p.isDefault);
        setCurrentProfile(defaultProfile || result.data[0]);
      }
    } catch (error) {
      console.error("Gagal load profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    if (profileId === currentProfile?.id) {
      setOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      const result = await switchProfilAction(profileId);
      if (result.success && result.data) {
        setCurrentProfile(result.data);
        onProfileSwitch?.(profileId);
        setOpen(false);
        
        // Reload untuk update context/permissions
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (error) {
      console.error("Gagal mengubah profil:", error);
      setIsSwitching(false);
    }
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
        return <User className="h-4 w-4" />;
      case "ORGANISASI":
        return <Building2 className="h-4 w-4" />;
      case "EKSTERNAL":
        return <Globe className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  if (!currentProfile) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 px-2 gap-2 hover:bg-accent"
          title={`Profil: ${currentProfile.nama}`}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={currentProfile.avatar} alt={currentProfile.nama} />
            <AvatarFallback className="text-xs font-semibold">
              {getInitials(currentProfile.nama)}
            </AvatarFallback>
          </Avatar>
          
          {profiles.length > 1 && (
            <div className="hidden sm:flex flex-col gap-0.5 text-left">
              <span className="text-xs font-medium leading-none">
                {currentProfile.nama}
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                {getProfileTypeLabel(currentProfile.tipe)}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="end">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={currentProfile.avatar}
                alt={currentProfile.nama}
              />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(currentProfile.nama)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {currentProfile.nama}
              </p>
              <p className="text-xs text-muted-foreground">
                {getProfileTypeLabel(currentProfile.tipe)}
              </p>
            </div>
          </div>
        </div>

        {/* Profil List */}
        {profiles.length > 1 && (
          <>
            <Separator />
            <div className="max-h-72 overflow-y-auto">
              <div className="space-y-1 p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-2">
                  Profil Lainnya ({profiles.length - 1})
                </p>
                
                {profiles.map((profile) => {
                  const isActive = profile.id === currentProfile?.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleSwitchProfile(profile.id)}
                      disabled={isActive || isSwitching}
                      className={`w-full px-3 py-2.5 rounded-md flex items-center gap-3 transition-all text-sm group ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent text-foreground disabled:opacity-50"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={profile.avatar} alt={profile.nama} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(profile.nama)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-xs truncate">
                          {profile.nama}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-muted-foreground text-xs truncate">
                            {getProfileTypeLabel(profile.tipe)}
                          </span>
                          {!isActive && !profile.aktif && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              Nonaktif
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs h-8"
            onClick={() => {
              setOpen(false);
              window.location.href = "/settings/profiles";
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            Kelola Profil
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
