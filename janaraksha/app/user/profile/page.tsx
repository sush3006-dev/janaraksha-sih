import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function UserProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

    if (error || !profile) {
        redirect("/auth/login");
    }

    if (profile.role !== "USER") {
        if (profile.role === "AUTHORITY") {
            redirect("/authority");
        }

        if (profile.role === "SUPER_ADMIN") {
            redirect("/admin");
        }

        redirect("/auth/login");
    }

    const displayName =
        profile.full_name?.trim() || "Citizen";

    const displayEmail =
        profile.email || user.email || "Not available";

    const initial = displayName
        .charAt(0)
        .toUpperCase();

    return (
        <main className="dashboard">
            <Sidebar activeItem="Profile" />

            <section className="dashboard-content user-profile-page">
                <header className="dashboard-header">
                    <div>
                        <a
                            href="/user"
                            className="profile-back-link"
                        >
                            ← Back to Dashboard
                        </a>

                        <p className="page-label">
                            ACCOUNT
                        </p>

                        <h1>My Profile</h1>

                        <p className="header-description">
                            View and manage your JanaRaksha citizen
                            profile.
                        </p>
                    </div>
                </header>

                <section className="user-profile-card">
                    <div className="user-profile-hero">
                        <div className="user-profile-avatar">
                            {initial}
                        </div>

                        <div className="user-profile-identity">
                            <h2>{displayName}</h2>

                            <p>{displayEmail}</p>

                            <span className="user-profile-role">
                                Citizen
                            </span>
                        </div>
                    </div>

                    <div className="user-profile-divider" />

                    <div className="user-profile-section">
                        <p className="profile-section-label">
                            PERSONAL INFORMATION
                        </p>

                        <div className="user-profile-info-grid">
                            <div className="user-profile-info">
                                <span>Full Name</span>
                                <strong>{displayName}</strong>
                            </div>

                            <div className="user-profile-info">
                                <span>Email Address</span>
                                <strong>{displayEmail}</strong>
                            </div>

                            <div className="user-profile-info">
                                <span>Account Type</span>
                                <strong>Citizen</strong>
                            </div>

                            <div className="user-profile-info">
                                <span>Account Status</span>
                                <strong className="profile-active">
                                    Active
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="user-profile-note">
                        <div className="profile-note-icon">
                            ✓
                        </div>

                        <div>
                            <strong>Your account is secure</strong>

                            <p>
                                Your account information is securely
                                managed through JanaRaksha and
                                Supabase authentication.
                            </p>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}