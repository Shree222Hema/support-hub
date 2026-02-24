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
import { LayoutDashboard, Users, Ticket as TicketIcon, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: TicketIcon,
    },
    {
      title: "Team",
      url: "/team",
      icon: Users,
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:w-[80px]">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-6">
              <Image
                src="/logo.png"
                alt="Traccel"
                width={180}
                height={70}
                className="h-auto w-auto transition-all group-data-[collapsible=icon]:hidden"
              />
              <div className="hidden group-data-[collapsible=icon]:flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
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
                  {data.navMain.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          size="lg"
                          isActive={isActive}
                          className={`px-4 py-6 text-base outline-none ring-0 border ${isActive
                            ? "bg-primary/5 border-primary text-primary font-bold hover:bg-primary/10 hover:text-primary"
                            : "border-transparent text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            }`}
                        >
                          <Link href={item.url}>
                            <item.icon className={`size-5! ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={isActive ? "font-bold" : "font-medium"}>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
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
                    <span className="text-sm font-semibold truncate">{user?.username}</span>
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
        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center gap-2 border-b px-6">
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
  );
}
