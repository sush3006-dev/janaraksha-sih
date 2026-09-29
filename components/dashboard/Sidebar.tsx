"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  FilePlus2,
  Files,
  LocateFixed,
  UserRound,
  LogOut,
  ClipboardList,
  ShieldCheck,
  Users,
  Building2,
  TimerReset,
  UserCog,
  Bell,
  ScrollText,
  BarChart3,
  Settings,
  Siren,
  Tags,
  FileText,
  ListChecks,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  userNavigation,
  authorityNavigation,
  adminNavigation,
} from "@/constants/navigation";

type SidebarProps = {
  activeItem?: string;
};

const supabase = createClient();

/* =========================================================
   NAVIGATION ICONS
========================================================= */

function getNavigationIcon(label: string) {
  const normalized = label.toLowerCase().trim();

  /* -------------------------
     COMMON / CITIZEN
  ------------------------- */

  if (normalized === "dashboard") {
    return LayoutDashboard;
  }

  if (
    normalized.includes("ai support") ||
    normalized.includes("support")
  ) {
    return Sparkles;
  }

  if (
    normalized.includes("register complaint") ||
    normalized.includes("new complaint") ||
    normalized.includes("report incident")
  ) {
    return FilePlus2;
  }

  if (
    normalized === "my complaints" ||
    normalized === "complaints"
  ) {
    return Files;
  }

  if (
    normalized.includes("complaint track") ||
    normalized.includes("track complaint") ||
    normalized === "track"
  ) {
    return LocateFixed;
  }

  if (normalized === "profile") {
    return UserRound;
  }


  /* -------------------------
     AUTHORITY
  ------------------------- */

  if (
    normalized.includes("complaint queue") ||
    normalized.includes("queue")
  ) {
    return ClipboardList;
  }

  if (
    normalized.includes("emergency") ||
    normalized.includes("sos")
  ) {
    return Siren;
  }

  if (
    normalized.includes("assigned") ||
    normalized.includes("assignment")
  ) {
    return ListChecks;
  }

  if (
    normalized.includes("authority profile")
  ) {
    return ShieldCheck;
  }


  /* -------------------------
     ADMIN
  ------------------------- */

  if (
    normalized.includes("users") ||
    normalized.includes("user management")
  ) {
    return Users;
  }

  if (
    normalized.includes("authorities") ||
    normalized.includes("authority management")
  ) {
    return Building2;
  }

  if (
    normalized.includes("categories") ||
    normalized.includes("category")
  ) {
    return Tags;
  }

  if (
    normalized.includes("complaints")
  ) {
    return FileText;
  }

  if (
    normalized.includes("sla") ||
    normalized.includes("escalation")
  ) {
    return TimerReset;
  }

  if (
    normalized.includes("roles") ||
    normalized.includes("permissions")
  ) {
    return UserCog;
  }

  if (
    normalized.includes("notifications")
  ) {
    return Bell;
  }

  if (
    normalized.includes("audit")
  ) {
    return ScrollText;
  }

  if (
    normalized.includes("analytics") ||
    normalized.includes("reports")
  ) {
    return BarChart3;
  }

  if (
    normalized.includes("settings")
  ) {
    return Settings;
  }


  /* -------------------------
     FALLBACK
  ------------------------- */

  return LayoutDashboard;
}


/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  activeItem,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = pathname.startsWith("/admin");
  const isAuthority = pathname.startsWith("/authority");

  const portalName = isAdmin
    ? "Admin Portal"
    : isAuthority
      ? "Authority Portal"
      : "Citizen Portal";

  const navigation = isAdmin
    ? adminNavigation
    : isAuthority
      ? authorityNavigation
      : userNavigation;


  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const isItemActive = (
    href: string,
    label: string
  ) => {
    if (activeItem) {
      return activeItem === label;
    }

    if (pathname === href) {
      return true;
    }

    return (
      href !== "/" &&
      pathname.startsWith(`${href}/`)
    );
  };


  /* =======================================================
     CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);


  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);


  /* =======================================================
     SIGN OUT
  ======================================================= */

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.push("/auth/login");
    router.refresh();
  }


  /* =======================================================
     CLOSE SIDEBAR
  ======================================================= */

  function closeSidebar() {
    setIsOpen(false);
  }


  return (
    <>
      {/* =================================================
          MOBILE HAMBURGER
      ================================================= */}

      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        aria-label={
          isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={isOpen}
        aria-controls="dashboard-sidebar"
      >
        {isOpen ? (
          <X size={23} />
        ) : (
          <Menu size={23} />
        )}
      </button>


      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        id="dashboard-sidebar"
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >

        {/* =================================================
            SIDEBAR TOP
        ================================================= */}

        <div className="sidebar-top">

          {/* ---------------------------------------------
              MOBILE HEADER
          --------------------------------------------- */}

          <div className="sidebar-mobile-header">

            <Link
              href={
                isAdmin
                  ? "/admin"
                  : isAuthority
                    ? "/authority"
                    : "/user"
              }
              className="brand"
              aria-label={`JanaRaksha ${portalName}`}
              onClick={closeSidebar}
            >
              <span className="brand-content">

                <strong className="brand-name">
                  JanaRaksha
                </strong>

                <span className="brand-portal">
                  {portalName}
                </span>

              </span>
            </Link>


            <button
              type="button"
              className="mobile-sidebar-close"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X size={21} />
            </button>

          </div>


          {/* ---------------------------------------------
              DIVIDER
          --------------------------------------------- */}

          <div className="sidebar-divider" />


          {/* ---------------------------------------------
              DESKTOP BRAND
          --------------------------------------------- */}

          <div className="sidebar-label">

            <img
              src="/images/JanaRaksha-logo.svg"
              alt=""
              className="sidebar-brand-logo"
              aria-hidden="true"
            />

            <span>
              JanaRaksha
            </span>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav
            className="sidebar-nav"
            aria-label={`${portalName} navigation`}
          >

            {navigation.map((item) => {

              const active =
                isItemActive(
                  item.href,
                  item.label
                );

              const Icon =
                getNavigationIcon(
                  item.label
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${
                    active ? "active" : ""
                  }`}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  onClick={closeSidebar}
                >

                  {/* ICON */}

                  <span
                    className="nav-icon"
                    aria-hidden="true"
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.9}
                    />
                  </span>


                  {/* LABEL */}

                  <span className="nav-label">
                    {item.label}
                  </span>


                  {/* ACTIVE DOT */}

                  {active && (
                    <span
                      className="nav-active-indicator"
                      aria-hidden="true"
                    />
                  )}

                </Link>
              );
            })}

          </nav>

        </div>


        {/* =================================================
            SIDEBAR BOTTOM
        ================================================= */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={handleSignOut}
          >

            <LogOut
              size={18}
              strokeWidth={1.9}
            />

            <span>
              Sign Out
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}