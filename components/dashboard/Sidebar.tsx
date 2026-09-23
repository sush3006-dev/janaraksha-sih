
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

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

export default function Sidebar({ activeItem }: SidebarProps) {
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

  const isItemActive = (href: string, label: string) => {
    if (activeItem) {
      return activeItem === label;
    }

    if (pathname === href) {
      return true;
    }

    return href !== "/" && pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.push("/auth/login");
    router.refresh();
  }

  function closeSidebar() {
    setIsOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="dashboard-sidebar"
      >
        {isOpen ? <X size={23} /> : <Menu size={23} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-top">
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
                <strong className="brand-name">JanaRaksha</strong>
                <span className="brand-portal">{portalName}</span>
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

          <div className="sidebar-divider" />

          <div className="sidebar-label">JanaRaksha</div>

          <nav
            className="sidebar-nav"
            aria-label={`${portalName} navigation`}
          >
            {navigation.map((item) => {
              const active = isItemActive(item.href, item.label);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={closeSidebar}
                >
                  <span
                    className={`nav-icon icon-${item.icon}`}
                    aria-hidden="true"
                  />

                  <span className="nav-label">{item.label}</span>

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

        <div className="sidebar-bottom">
          <button
            type="button"
            className="logout-button"
            onClick={handleSignOut}
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}