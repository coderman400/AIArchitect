import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Workflow, BarChart3, Settings, User } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/apps",
      icon: Home,
      current: location.pathname === "/apps" || location.pathname === "/apps/",
    },
    {
      name: "Flows",
      href: "/apps/flows",
      icon: Workflow,
      current: location.pathname === "/apps/flows",
    },
    {
      name: "Analytics",
      href: "/apps/analytics",
      icon: BarChart3,
      current: location.pathname === "/apps/analytics",
    },
    {
      name: "Settings",
      href: "/apps/settings",
      icon: Settings,
      current: location.pathname === "/apps/settings",
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
      {/* Logo/Brand */}
      <div className="flex items-center px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold">AI Architect</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.href}>
              <div
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
