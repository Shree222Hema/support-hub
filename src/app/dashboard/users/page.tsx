"use client";

import { Users, UserPlus, Search, UserCheck, Shield, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@example.com", role: "Super Admin", status: "Active", joined: "2024-01-15" },
  { id: 2, name: "John Doe", email: "john@example.com", role: "Agent", status: "Active", joined: "2024-02-10" },
  { id: 3, name: "Jane Smith", email: "jane@example.com", role: "Support", status: "Inactive", joined: "2024-03-05" },
];

export default function UsersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">Manage your support team and their permissions.</p>
        </div>
        <Button size="lg" className="rounded-xl gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Member
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." className="pl-12 h-12 bg-card border-none shadow-sm rounded-xl" />
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-accent/50">
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Joined At</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/30">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {user.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="rounded-full gap-1">
                        <Shield className="h-3 w-3" /> {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="text-sm">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
