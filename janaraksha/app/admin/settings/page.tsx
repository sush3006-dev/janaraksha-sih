import Link from "next/link";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import AdminSettingsActions from "../../../components/admin/AdminSettingsActions";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "SUPER_ADMIN") {
    if (profile?.role === "USER") {
      redirect("/user");
    }

    if (profile?.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Settings" />

      <section className="dashboard-content authority-settings-page">
        <header className="dashboard-header">
          <div>
            <p className="page-label">
              JANARAKSHA ADMIN PORTAL
            </p>

            <h1>Settings</h1>

            <p className="header-description">
              Manage your administrator account and security.
            </p>
          </div>

          <Link
            href="/admin"
            className="admin-view-button"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* ACCOUNT INFORMATION */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <p className="case-section-label">
                ACCOUNT
              </p>

              <h2>Account Information</h2>

              <p>
                Your account details and administrator access.
              </p>
            </div>
          </div>

          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span>Full Name</span>

              <strong>
                {profile.full_name || "Not provided"}
              </strong>
            </div>

            <div className="settings-info-item">
              <span>Email Address</span>

              <strong>
                {profile.email ||
                  user.email ||
                  "Not available"}
              </strong>
            </div>

            <div className="settings-info-item">
              <span>Account Role</span>

              <strong>SUPER_ADMIN</strong>
            </div>

            <div className="settings-info-item">
              <span>Account Status</span>

              <strong className="settings-active-status">
                Active
              </strong>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <p className="case-section-label">
                SECURITY
              </p>

              <h2>Account Security</h2>

              <p>
                Manage your authentication and current account
                session.
              </p>
            </div>
          </div>

          <AdminSettingsActions />
        </section>
      </section>
    </main>
  );
}