"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCcw, Ticket as TicketIcon, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTicketModal } from "@/components/CreateTicketModal";
import { toast } from "sonner";
import { ViewTicketModal } from "@/components/ViewTicketModal";
import { Input } from "@/components/ui/input";

export type Ticket = {
    id: string;
    title: string;
    description: string;
    status: "OPEN" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    assigned_to: string | null;
    user_id: string | null;
    tenant_id: string | null;
    user_email: string | null;
    source_app: string | null;
    created_at: string;
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const ITEMS_PER_PAGE = 10;

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/v1/tickets/");
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

    useEffect(() => {
        fetchTickets();
    }, []);

    const toggleStatus = async (ticket: Ticket) => {
        const newStatus = ticket.status === "OPEN" ? "CLOSED" : "OPEN";
        setActionLoading(`toggle-${ticket.id}`);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/tickets/${ticket.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Ticket marked as ${newStatus}`);
                fetchTickets(); // Refresh list to get updated data
            } else {
                toast.error("Failed to update ticket status");
            }
        } catch (error) {
            console.error("Failed to update ticket", error);
            toast.error("An error occurred while updating the ticket");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteTicket = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        setActionLoading(`delete-${id}`);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/tickets/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Ticket deleted successfully");
                fetchTickets();
            } else {
                toast.error("Failed to delete ticket");
            }
        } catch (error) {
            console.error("Failed to delete ticket", error);
            toast.error("An error occurred while deleting the ticket");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesFilter = filter === "ALL" ? true : ticket.status === filter;
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE) || 1;
    const paginatedTickets = filteredTickets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filter]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all support requests.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Input
                        type="search"
                        placeholder="Search tickets..."
                        className="w-full sm:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex bg-secondary p-1 rounded-lg shrink-0">
                        <Button
                            variant={filter === "ALL" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("ALL")}
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === "OPEN" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("OPEN")}
                        >
                            Open
                        </Button>
                        <Button
                            variant={filter === "CLOSED" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("CLOSED")}
                        >
                            Closed
                        </Button>
                    </div>
                    <CreateTicketModal onSuccess={fetchTickets} />
                </div>
            </div>

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
                                    <th className="px-4 py-3 border-r">Status</th>
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
                                            <td className="px-4 py-3 font-medium">{ticket.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === "OPEN"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
                                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                                                    }`}>
                                                    {ticket.status}
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
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                {ticket.assigned_to ? ticket.assigned_to.split("-")[0] : "Unassigned"}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleStatus(ticket)}
                                                    disabled={actionLoading === `toggle-${ticket.id}` || actionLoading === `delete-${ticket.id}`}
                                                >
                                                    {actionLoading === `toggle-${ticket.id}` ? "Updating..." : `Mark ${ticket.status === "OPEN" ? "CLOSED" : "OPEN"}`}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    onClick={() => setSelectedTicket(ticket)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    onClick={() => deleteTicket(ticket.id)}
                                                    disabled={actionLoading === `delete-${ticket.id}` || actionLoading === `toggle-${ticket.id}`}
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

            <ViewTicketModal
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </div>
    );
}
