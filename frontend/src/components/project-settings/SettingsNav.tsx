"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiCog, HiOfficeBuilding, HiGlobe, HiMail, HiBell,
  HiShieldCheck, HiUserGroup, HiLink, HiArchive, HiClipboardList, HiSupport,
} from "react-icons/hi";

export const NAV_ITEMS = [
  { key: "general",      label: "General",             icon: <HiCog size={15} />,           href: "/settings/project" },
  { key: "company",      label: "Company Information", icon: <HiOfficeBuilding size={15} />, href: "/settings/project/company" },
  { key: "localization", label: "Localization",        icon: <HiGlobe size={15} />,          href: "/settings/project/localization" },
  { key: "email",        label: "Email Settings",      icon: <HiMail size={15} />,           href: "/settings/project/email" },
  { key: "notifs",       label: "Notifications",       icon: <HiBell size={15} />,           href: "/settings/project/notifications" },
  { key: "security",     label: "Security",            icon: <HiShieldCheck size={15} />,    href: "/settings/project/security" },
  { key: "roles",        label: "Roles & Permissions", icon: <HiUserGroup size={15} />,      href: "/settings/project/roles" },
  { key: "integrations", label: "Integrations",        icon: <HiLink size={15} />,           href: "/settings/project/integrations" },
  { key: "backup",       label: "Backup & Export",     icon: <HiArchive size={15} />,        href: "/settings/project/backup" },
  { key: "activity",     label: "Activity Log",        icon: <HiClipboardList size={15} />,  href: "/settings/project/activity" },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <nav style={{ padding: "6px" }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== "/settings/project" && pathname.startsWith(item.href));
            return (
              <Link key={item.key} href={item.href}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", textDecoration: "none", color: isActive ? "#4f46e5" : "#475569", background: isActive ? "#eef2ff" : "transparent", fontWeight: isActive ? 600 : 500, fontSize: "0.875rem", marginBottom: "2px", transition: "all 0.15s" }}>
                <span style={{ color: isActive ? "#4f46e5" : "#94a3b8", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Need Help */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <HiSupport size={18} color="#4f46e5" />
        </div>
        <h4 style={{ margin: "0 0 6px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Need Help?</h4>
        <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.5 }}>
          If you need help with project settings, please contact our support team.
        </p>
        <button style={{ padding: "6px 14px", border: "1.5px solid #4f46e5", borderRadius: "7px", background: "#fff", color: "#4f46e5", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
          Contact Support
        </button>
      </div>
    </div>
  );
}
