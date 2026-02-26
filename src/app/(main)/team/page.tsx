"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCcw, Users, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { ViewTeamModal } from "@/components/ViewTeamModal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<{ id: string, name: string } | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (user && user.role !== "MANAGER") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/team/");
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (error) {
            console.error("Failed to fetch team members", error);
            toast.error("Failed to fetch team members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const confirmDeleteMember = async () => {
        if (!memberToDelete) return;

        const { id, name } = memberToDelete;
        setActionLoading(`delete-${id}`);
        setMemberToDelete(null); // Close modal immediately while loading
        try {
            const res = await fetch(`/api/v1/team/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success(`${name} removed from the team`);
                fetchTeam();
            } else {
                toast.error("Failed to remove team member");
            }
        } catch (error) {
            console.error("Failed to delete team member", error);
            toast.error("An error occurred while removing the team member");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTeam = team.filter((member) => {
        const query = searchQuery.toLowerCase();
        return (
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredTeam.length / ITEMS_PER_PAGE) || 1;
    const paginatedTeam = filteredTeam.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (!user || user.role !== "MANAGER") {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground mt-1">Manage support agents and their roles.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Input
                        type="search"
                        placeholder="Search team members..."
                        className="w-full sm:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <CreateTeamModal onSuccess={fetchTeam} />
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Team Roster</CardTitle>
                    <Button variant="outline" size="icon" onClick={fetchTeam} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3 border-r w-1/4">Name</th>
                                    <th className="px-4 py-3 border-r w-1/3">Email</th>
                                    <th className="px-4 py-3 border-r w-1/4">Role</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <Users className="w-12 h-12 text-muted-foreground/50" />
                                                <div className="text-lg font-medium text-muted-foreground">
                                                    {loading ? "Loading team roster..." : "No team members found"}
                                                </div>
                                                {!loading && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Add agents to your team to assign them to support tickets.
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTeam.map((member) => (
                                        <tr key={member.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 font-medium flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                {member.name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                                            <td className="px-4 py-3">
                                                {member.role === "MANAGER" ? (
                                                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                                                        Manager
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
                                                        User
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    onClick={() => setSelectedMember(member)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    onClick={() => setMemberToDelete({ id: member.id, name: member.name })}
                                                    title="Remove Member"
                                                    disabled={actionLoading === `delete-${member.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTeam.length)}</span> of <span className="font-medium">{filteredTeam.length}</span> results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="text-sm font-medium px-2">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ViewTeamModal
                member={selectedMember}
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
            />

            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <strong>{memberToDelete?.name}</strong> from the team.
                            They will lose all assigned access and permissions. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteMember} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
