import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  BarChart, 
  History,
  Linkedin,
  Twitter,
  Mail,
  Menu,
  X,
  Instagram,
  BarChartHorizontal,
  FileText,
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active = false }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center p-3 rounded-md font-medium transition-colors",
        active 
          ? "text-[#0077B5] bg-blue-50" 
          : "text-gray-600 hover:bg-gray-100"
      )}>
        <span className="mr-3">{icon}</span>
        <span>{children}</span>
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <aside className="bg-white md:w-64 w-full md:min-h-screen border-r border-gray-200 md:fixed md:inset-y-0 z-10">
      <div className="p-4 flex justify-between items-center md:justify-start border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Linkedin className="h-6 w-6 text-[#0077B5]" />
          <h1 className="text-xl font-semibold text-[#0077B5] hidden md:block">AI Agent Dashboard</h1>
        </div>
        <button 
          className="md:hidden text-gray-500"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className={cn("p-4", isOpen ? "block" : "hidden md:block")} id="navigation-menu">
        <div className="space-y-1">
          <NavItem href="/" icon={<LayoutDashboard size={18} />} active={location === "/"}>
            Dashboard
          </NavItem>
          <NavItem href="/settings" icon={<Settings size={18} />} active={location === "/settings"}>
            Settings
          </NavItem>
          <NavItem href="/team" icon={<Users size={18} />} active={location === "/team"}>
            Team Management
          </NavItem>
          <NavItem href="/analytics" icon={<BarChart size={18} />} active={location === "/analytics"}>
            Advanced Analytics
          </NavItem>
          <NavItem href="/activity" icon={<History size={18} />} active={location === "/activity"}>
            Activity Log
          </NavItem>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Active Agents
          </h3>
          <div className="mt-2 space-y-1">
            <NavItem href="/agent/linkedin" icon={<Linkedin size={18} />} active={location.includes("linkedin")}>
              LinkedIn Outreach
            </NavItem>
            <NavItem href="/agent/instagram" icon={<Instagram size={18} />} active={location.includes("instagram")}>
              Instagram Warm Leads
            </NavItem>
            <NavItem href="/agent/newsletter" icon={<FileText size={18} />} active={location.includes("newsletter")}>
              Newsletter Analytics
            </NavItem>
            <NavItem href="/agent/twitter" icon={<Twitter size={18} />} active={location.includes("twitter")}>
              Twitter Engagement
            </NavItem>
            <NavItem href="/agent/email" icon={<Mail size={18} />} active={location.includes("email")}>
              Email Campaign
            </NavItem>
          </div>
        </div>
      </nav>
    </aside>
  );
}
