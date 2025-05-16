"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserButton,
  OrganizationSwitcher,
  useOrganization,
} from "@clerk/nextjs";
import { Settings, Activity, Database, Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminHeader: React.FC = () => {
  const path = usePathname();
  const { organization } = useOrganization();

  const navItems = [
    { name: "Dashboard", path: "/organization/dashboard", icon: Activity },
    { name: "Services", path: "/organization/services", icon: Database },
    { name: "Incidents", path: "/organization/incidents", icon: Bell },
    { name: "Maintenance", path: "/organization/maintenance", icon: Clock },
  ];

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/organization/dashboard"
              className="flex items-center space-x-2"
            >
              <h1 className="text-xl font-semibold text-gray-900">
                Status Pulse
              </h1>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    path === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href={`/${organization?.slug}`}
              target="_blank"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View Public Dashboard
            </Link>

            <div className="hidden md:block">
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "w-[200px]",
                    organizationSwitcherTrigger: "w-full justify-between",
                  },
                }}
              />
            </div>

            <Link
              href="/organization/settings"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                path === "/organization/settings"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </Link>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex space-x-1 py-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                path === item.path
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
