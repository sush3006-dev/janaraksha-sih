import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminProfileActions from "@/components/admin/AdminProfileActions";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "SUPER_ADMIN") {
    if (profile?.role === "USER") {
      redirect("/user");
    }

    if (profile?.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  const displayName = profile.full_name || "Admin";
  const displayEmail = profile.email || user.email || "No email available";

  const memberSince = new Date(
    profile.created_at,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="dashboard">
      <Sidebar activeItem="Profile" />

      <div className="dashboard-content">
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Admin Profile</h1>

            <p className="authority-description">
              Manage your administrator account and security details.
            </p>
          </div>

          <div className="authority-header-actions">
            <Link
              href="/admin"
              className="admin-view-button"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                ACCOUNT OVERVIEW
              </p>

              <h2>Profile Information</h2>

              <p>
                Your account details and administrator access information.
              </p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Full Name
              </span>

              <strong className="profile-detail-value">
                {displayName}
              </strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Email Address
              </span>

              <strong className="profile-detail-value">
                {displayEmail}
              </strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Account Role
              </span>

              <strong className="profile-detail-value">
                SUPER_ADMIN
              </strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Account Status
              </span>

              <strong className="profile-detail-value profile-status-active">
                Active
              </strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Member Since
              </span>

              <strong className="profile-detail-value">
                {memberSince}
              </strong>
            </div>

            <div className="profile-detail-item">
              <span className="profile-detail-label">
                Email Verification
              </span>

              <strong className="profile-detail-value">
                {user.email_confirmed_at
                  ? "Verified"
                  : "Not Verified"}
              </strong>
            </div>
          </div>
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                PROFILE MANAGEMENT
              </p>

              <h2>Edit Profile</h2>

              <p>
                Update your administrator name.
              </p>
            </div>
          </div>

          <AdminProfileActions
            userId={user.id}
            currentName={displayName}
          />
        </section>
      </div>
    </main>
  );
}