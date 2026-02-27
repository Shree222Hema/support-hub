"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Ticket as TicketIcon, Eye, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTicketModal } from "@/components/CreateTicketModal";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ViewTicketModal } from "@/components/ViewTicketModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LayoutList, Kanban } from "lucide-react";

export type Ticket = {
    id: string;
    title: string;
    description: string;
    state: "OPEN" | "IN_PROGRESS" | "UNDER_PROGRESS" | "COMPLETED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    assigned_to: string | null;
    user_id: string | null;
    tenant_id: string | null;
    user_email: string | null;
    source_app: string | null;
    type: "BUG" | "TASK" | "STORY" | "EPIC";
    story_points: number | null;
    labels: string[];
    due_date: string | null;
    epic_link: string | null;
    created_at: string;
};

type TeamMember = {
    id: string;
    name: string;
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        state: "ALL",
        priority: "ALL"
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [viewMode, setViewMode] = useState<"LIST" | "BOARD">("BOARD");

    const ITEMS_PER_PAGE = 10;

    const { user } = useAuth();

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.state !== "ALL") params.append("state", filters.state);
            if (user) {
                params.append("user_id", user.id);
                params.append("role", user.role);
            }

            const res = await fetch(`/api/v1/tickets/?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            toast.error("Failed to fetch tickets. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch("/api/v1/team/");
            if (res.ok) {
                const data = await res.json();
                setTeamMembers(data);
            }
        } catch (error) {
            console.error("Failed to fetch team members", error);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchTeamMembers();
    }, []);

    const updateState = async (ticket: Ticket, newState: Ticket["state"]) => {
        setActionLoading(`state-${ticket.id}`);
        try {
            const res = await fetch(`/api/v1/tickets/${ticket.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ state: newState }),
            });
            if (res.ok) {
                toast.success(`Ticket state updated to ${newState}`);
                fetchTickets();
            } else {
                toast.error("Failed to update ticket state");
            }
        } catch (error) {
            console.error("Failed to update ticket", error);
            toast.error("An error occurred while updating the ticket");
        } finally {
            setActionLoading(null);
        }
    };

    const updateAssignment = async (ticket: Ticket, newAssigneeId: string) => {
        setActionLoading(`assign-${ticket.id}`);
        try {
            const res = await fetch(`/api/v1/tickets/${ticket.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_to: newAssigneeId === "none" ? null : newAssigneeId }),
            });
            if (res.ok) {
                toast.success(`Ticket assigned successfully`);
                fetchTickets();
            } else {
                toast.error("Failed to update ticket assignment");
            }
        } catch (error) {
            console.error("Failed to update ticket", error);
            toast.error("An error occurred while updating the ticket");
        } finally {
            setActionLoading(null);
        }
    };


    const filteredTickets = tickets.filter((ticket) => {
        const matchesState = filters.state === "ALL" ? true : ticket.state === filters.state;
        const matchesPriority = filters.priority === "ALL" ? true : ticket.priority === filters.priority;
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesState && matchesPriority && matchesSearch;
    });

    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE) || 1;
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all support requests.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <Input
                        type="search"
                        placeholder="Search tickets..."
                        className="w-full sm:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <Select value={filters.state} onValueChange={(val) => setFilters(f => ({ ...f, state: val }))}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All States</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="UNDER_PROGRESS">Under Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(val) => setFilters(f => ({ ...f, priority: val }))}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priorities</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex bg-muted p-1 rounded-md shrink-0">
                        <Button
                            variant={viewMode === "LIST" ? "default" : "ghost"}
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setViewMode("LIST")}
                        >
                            <LayoutList className="w-4 h-4 mr-2" /> List
                        </Button>
                        <Button
                            variant={viewMode === "BOARD" ? "default" : "ghost"}
                            size="sm"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setViewMode("BOARD")}
                        >
                            <Kanban className="w-4 h-4 mr-2" /> Board
                        </Button>
                    </div>

                    <CreateTicketModal onSuccess={fetchTickets} />
                </div>
            </div>

            {viewMode === "BOARD" ? (
                <KanbanBoard tickets={filteredTickets} onStateChange={updateState} onTicketClick={setSelectedTicket} />
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Ticket Directory</CardTitle>
                        <Button variant="outline" size="icon" onClick={fetchTickets} disabled={loading}>
                            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3 border-r">ID (Abbr.)</th>
                                        <th className="px-4 py-3 border-r">Title</th>
                                        <th className="px-4 py-3 border-r">Type</th>
                                        <th className="px-4 py-3 border-r">State</th>
                                        <th className="px-4 py-3 border-r">Priority</th>
                                        <th className="px-4 py-3 border-r">Assigned To</th>
                                        <th className="px-4 py-3 border-r">Created At</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <TicketIcon className="w-12 h-12 text-muted-foreground/50" />
                                                    <div className="text-lg font-medium text-muted-foreground">
                                                        {loading ? "Loading tickets..." : "No tickets found"}
                                                    </div>
                                                    {!loading && (
                                                        <p className="text-sm text-muted-foreground">
                                                            There are no individual support tickets matching the current criteria.
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTickets.map((ticket) => (
                                            <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs">{ticket.id.split('-')[0]}</td>
                                                <td className="px-4 py-3 font-medium">
                                                    <Link href={`/tickets/${ticket.id}`} className="text-blue-600 hover:underline">
                                                        {ticket.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${ticket.type === "BUG" ? "bg-red-50 text-red-700 border-red-200" :
                                                        ticket.type === "STORY" ? "bg-green-50 text-green-700 border-green-200" :
                                                            ticket.type === "EPIC" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                                "bg-blue-50 text-blue-700 border-blue-200"
                                                        }`}>
                                                        {ticket.type || "TASK"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.state === "OPEN" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500" :
                                                        ticket.state === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500" :
                                                            ticket.state === "UNDER_PROGRESS" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500" :
                                                                ticket.state === "COMPLETED" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500" :
                                                                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                                        }`}>
                                                        {ticket.state.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.priority === "HIGH"
                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"
                                                        : ticket.priority === "MEDIUM"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                        }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Select
                                                        value={ticket.assigned_to || "none"}
                                                        onValueChange={(val) => updateAssignment(ticket, val)}
                                                        disabled={actionLoading === `assign-${ticket.id}`}
                                                    >
                                                        <SelectTrigger className="h-8 w-[130px] text-xs bg-transparent border-dashed hover:border-solid transition-all">
                                                            <SelectValue placeholder="Assign To..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Unassigned</SelectItem>
                                                            {teamMembers.map((member) => (
                                                                <SelectItem key={member.id} value={member.id}>
                                                                    {member.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                    <Select
                                                        value={ticket.state}
                                                        onValueChange={(val: Ticket["state"]) => updateState(ticket, val)}
                                                        disabled={actionLoading === `state-${ticket.id}`}
                                                    >
                                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="OPEN">Open</SelectItem>
                                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                            <SelectItem value="UNDER_PROGRESS">Under Progress</SelectItem>
                                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-8 h-8"
                                                        asChild
                                                    >
                                                        <Link href={`/tickets/${ticket.id}`}>
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-8 h-8"
                                                        onClick={() => setSelectedTicket(ticket)}
                                                    >
                                                        <Eye className="w-4 h-4" />
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
                                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}</span> of <span className="font-medium">{filteredTickets.length}</span> results
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
            )}

            <ViewTicketModal
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onSuccess={() => {
                    fetchTickets();
                    // Optionally update the local selectedTicket so the modal reflects the change immediately
                    // Since fetchTickets is async and the modal might stay open, this is cleaner:
                    setSelectedTicket(null);
                }}
            />
        </div>
    );
}
