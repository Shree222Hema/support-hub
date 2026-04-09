"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, Settings, User, LogOut, Kanban, Ticket, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/auth-guard";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Kanban",
      url: "/dashboard/kanban",
      icon: Kanban,
    },
    {
      title: "Tickets",
      url: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();

  return (
    <AuthGuard>
      <TooltipProvider>
        <SidebarProvider>
          <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:w-[80px]">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-bold px-4 mb-2 uppercase tracking-wider">
                  Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-2">
                    {data.navMain.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.title} 
                          size="lg"
                          className="px-4 py-6 text-base"
                        >
                          <Link href={item.url}>
                            <item.icon className="text-primary size-5!" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
              <SidebarMenu className="gap-4">
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-semibold truncate">{user?.email}</span>
                      <span className="text-xs text-muted-foreground">Administrator</span>
                    </div>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={logout} 
                    tooltip="Logout" 
                    size="lg"
                    className="px-4 py-6 text-base text-destructive hover:text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="size-5!" />
                    <span className="font-medium">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[#f8fafc]">
              <div className="absolute h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
              <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[130px]" />
              <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[130px]" />
            </div>

            <header className="flex h-20 shrink-0 items-center gap-2 border-b px-6 bg-white/40 backdrop-blur-md z-10 sticky top-0">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-6" />
              <Breadcrumb>
                <BreadcrumbList className="text-sm">
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="font-medium">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">Overview</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthGuard>
  );
}
