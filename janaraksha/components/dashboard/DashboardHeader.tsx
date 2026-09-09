"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    }

    loadProfile();
  }, [supabase]);

  const name = profile?.full_name || "User";

  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="dashboard-header">
      <div>
        <p className="page-label">CITIZEN PORTAL</p>

        <h1>{title}</h1>

        <p className="header-description">{description}</p>
      </div>

      <div className="profile-badge">
        <div className="profile-avatar">
          {initial}
        </div>

        <div>
          <strong>{name}</strong>

          <span>
            {profile?.role === "USER" ? "Citizen" : profile?.role}
          </span>
        </div>
      </div>
    </header>
  );
}