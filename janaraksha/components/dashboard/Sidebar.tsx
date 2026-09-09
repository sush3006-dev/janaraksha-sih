"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  userNavigation,
  authorityNavigation,
} from "@/constants/navigation";

type SidebarProps = {
  activeItem?: string;
};

export default function Sidebar({
  activeItem,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const isAuthority = pathname.startsWith("/authority");

  const navigation = isAuthority
    ? authorityNavigation
    : userNavigation;

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <h2>JanaRaksha</h2>
        <span>
          {isAuthority
            ? "Authority Portal"
            : "Citizen Portal"}
        </span>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${
              activeItem === item.label ||
              (!activeItem &&
                pathname === item.href)
                ? "active"
                : ""
            }`}
          >
            <span
              className={`nav-icon icon-${item.icon}`}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="logout-button"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}