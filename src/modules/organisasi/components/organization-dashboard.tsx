"use client";

/**
 * Organization Dashboard Component
 * Tampilkan info organisasi + pimpinan aktif + anggota
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { getActiveLeaderAction, getOrganizationMembersAction } from "../actions";
import type { OrganisasiWithTree, PimpinanAktifDTO } from "../types";

interface OrganizationDashboardProps {
  organisasi: OrganisasiWithTree;
  onEditClick?: () => void;
  onManageMembersClick?: () => void;
  onManageLeadershipClick?: () => void;
}

export function OrganizationDashboard({
  organisasi,
  onEditClick,
  onManageMembersClick,
  onManageLeadershipClick,
}: OrganizationDashboardProps) {
  const [pimpinan, setPimpinan] = useState<PimpinanAktifDTO | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [leaderRes, membersRes] = await Promise.all([
          getActiveLeaderAction(organisasi.id),
          getOrganizationMembersAction(organisasi.id),
        ]);

        if (leaderRes.success && leaderRes.data) {
          setPimpinan(leaderRes.data);
        }
        if (membersRes.success && membersRes.data) {
          setMembers(membersRes.data.slice(0, 5)); // Tampilkan 5 anggota pertama
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [organisasi.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{organisasi.nama}</CardTitle>
              {organisasi.singkatan && (
                <CardDescription>{organisasi.singkatan}</CardDescription>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Icon icon="lucide:edit" className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline">{organisasi.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jenis</p>
              <Badge variant={organisasi.jenis === "STRUKTURAL" ? "secondary" : "outline"}>
                {organisasi.jenis === "STRUKTURAL" ? "Struktural" : "Pokja"}
              </Badge>
            </div>
            {organisasi.eselon && (
              <div>
                <p className="text-xs text-muted-foreground">Eselon</p>
                <p className="font-medium text-sm">{organisasi.eselon}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Anggota</p>
              <p className="font-medium text-sm">{organisasi.jumlahAnggota}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pimpinan Aktif */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pimpinan</CardTitle>
        </CardHeader>
        <CardContent>
          {pimpinan ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(pimpinan.nama)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{pimpinan.nama}</p>
                  <p className="text-xs text-muted-foreground">{pimpinan.email}</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {pimpinan.tipeKepemimpinan}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onManageLeadershipClick}
              >
                Ubah
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Belum ada pimpinan yang ditugaskan
              </p>
              <Button
                size="sm"
                onClick={onManageLeadershipClick}
              >
                Tugaskan Pimpinan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daftar Anggota */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Anggota Organisasi</CardTitle>
              <CardDescription>
                {organisasi.jumlahAnggota} anggota
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageMembersClick}
            >
              Kelola
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.peran}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada anggota
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
