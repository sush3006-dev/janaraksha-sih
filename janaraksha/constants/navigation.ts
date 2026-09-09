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