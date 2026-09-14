import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import AuthoritySettingsActions from "@/components/dashboard/AuthoritySettingsActions";

export default async function AuthoritySettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "AUTHORITY") {
    return null;
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Settings" />

      <section className="dashboard-content authority-settings-page">
        <header className="dashboard-header">
          <div>
            <p className="page-label">
              AUTHORITY PORTAL
            </p>

            <h1>Settings</h1>

            <p className="header-description">
              Manage your authority account and security.
            </p>
          </div>
        </header>

        {/* ACCOUNT */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <p className="case-section-label">
                ACCOUNT
              </p>

              <h2>Account Information</h2>

              <p>
                Your account details and authority status.
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

              <strong>AUTHORITY</strong>
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
                Manage your authentication and current
                account session.
              </p>
            </div>
          </div>

          <AuthoritySettingsActions />
        </section>
      </section>
    </main>
  );
}