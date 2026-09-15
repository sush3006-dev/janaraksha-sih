import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import AuthorityProfileActions from "@/components/dashboard/AuthorityProfileActions";
import AuthorityProfileImage from "@/components/dashboard/AuthorityProfileImage";
export default async function AuthorityProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, role, created_at")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "AUTHORITY") {
        return null;
    }

    const fullName = profile.full_name || "Authority User";

    const email =
        profile.email || user.email || "Not available";

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((name: string) => name.charAt(0).toUpperCase())
        .join("");

    const memberSince = new Date(
        profile.created_at
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const isEmailVerified = Boolean(
        user.email_confirmed_at
    );

    return (
        <main className="dashboard">
            <Sidebar activeItem="Profile" />

            <section className="dashboard-content authority-profile-page">
                <header className="dashboard-header profile-page-header">
                    <div>
                        <p className="page-label">
                            AUTHORITY PORTAL
                        </p>

                        <h1>Profile</h1>

                        <p className="header-description">
                            Manage your authority account information.
                        </p>
                    </div>
                </header>

                {/* PROFILE HERO */}
                <section className="profile-hero-card">
                    <div className="profile-avatar">
                        {initials}
                    </div>

                    <div className="profile-hero-info">
                        <h2>{fullName}</h2>

                        <p className="profile-email">
                            <span>✉</span>
                            {email}
                        </p>

                        <div className="profile-hero-meta">
                            <span
                                className={
                                    isEmailVerified
                                        ? "profile-verified-badge"
                                        : "profile-unverified-badge"
                                }
                            >
                                {isEmailVerified
                                    ? "✓ Verified"
                                    : "Email Not Verified"}
                            </span>

                            <span className="profile-account-badge">
                                AUTHORITY
                            </span>
                        </div>

                        <p className="profile-member-since">
                            <span>◷</span>
                            Member since {memberSince}
                        </p>
                    </div>

                    <span
                        className={
                            isEmailVerified
                                ? "profile-verified-badge"
                                : "profile-unverified-badge"
                        }
                    >
                        {isEmailVerified
                            ? "✓ Verified"
                            : "Email Not Verified"}
                    </span>
                </section>

                {/* PERSONAL INFORMATION */}
                <section className="profile-section-card">
                    <div className="profile-section-header">
                        <div className="profile-section-icon">
                            ◯
                        </div>

                        <div>
                            <p className="case-section-label">
                                PERSONAL INFORMATION
                            </p>

                            <h2>Personal Information</h2>

                            <p>
                                Information associated with your authority
                                account.
                            </p>
                        </div>
                    </div>

                    <div className="profile-info-list">
                        <div className="profile-info-row">
                            <span>Full Name</span>

                            <strong>{fullName}</strong>
                        </div>

                        <div className="profile-info-row">
                            <span>Email Address</span>

                            <strong>{email}</strong>
                        </div>

                        <div className="profile-info-row">
                            <span>Account Type</span>

                            <strong>Authority</strong>
                        </div>
                    </div>

                    <AuthorityProfileActions
                        currentName={fullName}
                    />
                </section>

                {/* ACCOUNT INFORMATION */}
                <section className="profile-section-card">
                    <div className="profile-section-header">
                        <div className="profile-section-icon">
                            ≡
                        </div>

                        <div>
                            <p className="case-section-label">
                                ACCOUNT INFORMATION
                            </p>

                            <h2>Account Information</h2>

                            <p>
                                Current status and authentication
                                information.
                            </p>
                        </div>
                    </div>

                    <div className="profile-info-list">
                        <div className="profile-info-row">
                            <span>Account Status</span>

                            <strong className="profile-active-status">
                                Active
                            </strong>
                        </div>

                        <div className="profile-info-row">
                            <span>Email Verification</span>

                            <strong
                                className={
                                    isEmailVerified
                                        ? "profile-active-status"
                                        : "profile-pending-status"
                                }
                            >
                                {isEmailVerified
                                    ? "Verified"
                                    : "Not Verified"}
                            </strong>
                        </div>

                        <div className="profile-info-row">
                            <span>Member Since</span>

                            <strong>{memberSince}</strong>
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}