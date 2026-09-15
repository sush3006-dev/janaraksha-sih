type NavigationItem = {
  label: string;
  href: string;
  icon?: string;
};

export const userNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/user",
    icon: "dashboard",
  },
  {
    label: "AI Support",
    href: "/user/ai-support",
    icon: "ai",
  },
  {
    label: "Register Complaint",
    href: "/user/register-complaint",
    icon: "complaints",
  },
  {
    label: "My Complaints",
    href: "/user/complaints",
    icon: "complaints",
  },
  {
    label: "Complaint Track",
    href: "/user/track",
    icon: "track",
  },
  {
    label: "Profile",
    href: "/user/profile",
    icon: "profile",
  },
];

export const authorityNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/authority",
    icon: "dashboard",
  },
  {
    label: "Complaints",
    href: "/authority/complaints",
    icon: "complaints",
  },
  {
    label: "Assigned Complaints",
    href: "/authority/assigned-complaints",
    icon: "assigned",
  },
  {
    label: "Closed Complaints",
    href: "/authority/closed-complaints",
    icon: "closed",
  },
  {
    label: "Settings",
    href: "/authority/settings",
    icon: "settings",
  },
  {
    label: "Profile",
    href: "/authority/profile",
    icon: "profile",
  },
];

export const adminNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "users",
  },
  {
    label: "Authorities",
    href: "/admin/authorities",
    icon: "authority",
  },
  {
    label: "Complaints",
    href: "/admin/complaints",
    icon: "complaints",
  },
  {
    label: "Assignments",
    href: "/admin/assignments",
    icon: "assigned",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    label: "Profile",
    href: "/admin/profile",
    icon: "profile",
  },
];