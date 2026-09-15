import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminAuthoritiesTable from "@/components/dashboard/AdminAuthoritiesTable";

export default async function AdminAuthoritiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    console.error(
      "Profile fetch error:",
      profileError
    );

    redirect("/auth/login");
  }

  // SUPER ADMIN ONLY
  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "USER") {
      redirect("/user");
    }

    if (profile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // Get all authority accounts
  const {
    data: authorities,
    error: authoritiesError,
  } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, account_status, created_at"
    )
    .eq("role", "AUTHORITY")
    .order("created_at", {
      ascending: false,
    });

  if (authoritiesError) {
    console.error(
      "Authorities fetch error:",
      authoritiesError
    );
  }

  // Get all complaints assigned to authorities
  const {
    data: complaints,
    error: complaintsError,
  } = await supabase
    .from("complaints")
    .select(
      "assigned_authority_id, status"
    )
    .not("assigned_authority_id", "is", null);

  if (complaintsError) {
    console.error(
      "Authority complaints fetch error:",
      complaintsError
    );
  }

  // Calculate assigned and closed counts
  const complaintCounts = new Map<
    string,
    {
      assigned_count: number;
      closed_count: number;
    }
  >();

  complaints?.forEach((complaint) => {
    if (!complaint.assigned_authority_id) {
      return;
    }

    const current =
      complaintCounts.get(
        complaint.assigned_authority_id
      ) ?? {
        assigned_count: 0,
        closed_count: 0,
      };

    current.assigned_count += 1;

    if (complaint.status === "CLOSED") {
      current.closed_count += 1;
    }

    complaintCounts.set(
      complaint.assigned_authority_id,
      current
    );
  });

  const authoritiesWithCounts =
    authorities?.map((authority) => {
      const counts =
        complaintCounts.get(authority.id) ?? {
          assigned_count: 0,
          closed_count: 0,
        };

      return {
        id: authority.id,
        full_name: authority.full_name,
        email: authority.email,
        account_status: authority.account_status,
        created_at: authority.created_at,
        assigned_count: counts.assigned_count,
        closed_count: counts.closed_count,
      };
    }) ?? [];

  return (
    <main className="dashboard">
      <Sidebar activeItem="Authorities" />

      <div className="dashboard-content">
        {/* HEADER */}
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Authorities</h1>

            <p className="authority-description">
              Manage registered authorities and
              monitor their complaint activity.
            </p>
          </div>

          <div className="authority-header-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <span className="notification-icon">
                ♧
              </span>
            </button>

            <Link
              href="/admin/profile"
              className="profile-button"
            >
              <span className="profile-icon">
                ●
              </span>

              <span>Profile</span>
            </Link>
          </div>
        </header>

        {/* AUTHORITY LIST */}
        <section className="authority-priority-section">
          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                Account Management
              </p>

              <h2>
                Registered Authorities
              </h2>
            </div>
          </div>

          <AdminAuthoritiesTable
            authorities={authoritiesWithCounts}
          />
        </section>
      </div>
    </main>
  );
}