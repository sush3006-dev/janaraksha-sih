"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type DashboardHeaderProps = {
  title: string;
  description: string;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string;
};

export default function DashboardHeader({
  title,
  description,
}: DashboardHeaderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile loading error:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    }

    loadProfile();
  }, []);

  const name = profile?.full_name?.trim() || "User";
  const initial = name.charAt(0).toUpperCase();

  const roleLabel =
    profile?.role?.toUpperCase() === "USER"
      ? "Citizen"
      : profile?.role || "Citizen";

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-copy">
        <p className="page-label">CITIZEN PORTAL</p>
        <h1>{title}</h1>
        <p className="header-description">{description}</p>
      </div>

      <Link
        href="/user/profile"
        className="premium-profile-card"
        aria-label="Open profile"
      >
        <div className="premium-profile-avatar">
          <span>{initial}</span>
          <span className="profile-online-dot" />
        </div>

        <div className="premium-profile-details">
          <strong>{name}</strong>
          <span>{roleLabel}</span>
        </div>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className="premium-profile-chevron"
        />
      </Link>
    </header>
  );
}