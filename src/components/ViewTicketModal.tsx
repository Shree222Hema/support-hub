import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ticket = {
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
    created_at: string;
};

interface ViewTicketModalProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export function ViewTicketModal({ ticket, isOpen, onClose, onSuccess }: ViewTicketModalProps) {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTeam();
        }
    }, [isOpen]);

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/v1/team/");
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } catch (error) {
            console.error("Failed to fetch team", error);
        }
    };

    const handleAssign = async (memberId: string) => {
        if (!ticket) return;
        setIsUpdating(true);
        try {
            const assigned_to = memberId === "unassigned" ? null : memberId;
            const res = await fetch(`/api/v1/tickets/${ticket.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_to }),
            });

            if (res.ok) {
                toast.success("Ticket reassigned successfully");
                if (onSuccess) onSuccess();
            } else {
                toast.error("Failed to reassign ticket");
            }
        } catch (error) {
            console.error("Error assigning ticket:", error);
            toast.error("Error assigning ticket");
        } finally {
            setIsUpdating(false);
        }
    };
    if (!ticket) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start gap-4 pr-6">
                        <DialogTitle className="text-xl font-bold leading-tight flex-1">
                            {ticket.title}
                        </DialogTitle>
                        <div className="flex gap-2 shrink-0">
                            <Badge variant={ticket.state === "OPEN" ? "default" : "secondary"} className={
                                ticket.state === "OPEN" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500" :
                                    ticket.state === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500" :
                                        ticket.state === "UNDER_PROGRESS" ? "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-500" :
                                            ticket.state === "COMPLETED" ? "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-500" :
                                                "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
                            }>
                                {ticket.state.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={
                                ticket.priority === "HIGH"
                                    ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800"
                                    : ticket.priority === "MEDIUM"
                                        ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-800"
                                        : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            }>
                                {ticket.priority}
                            </Badge>
                        </div>
                    </div>
                    <DialogDescription className="text-xs font-mono mt-1">
                        ID: {ticket.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-4">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                            <div className="text-sm bg-muted/30 p-4 rounded-md whitespace-pre-wrap border">
                                {ticket.description || "No description provided."}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</h4>
                                <p className="text-sm">{ticket.created_at ? format(new Date(ticket.created_at), "PPp") : "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned To</h4>
                                <Select
                                    value={ticket.assigned_to || "unassigned"}
                                    onValueChange={handleAssign}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue placeholder="Select team member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {team.map((member) => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.name} ({member.role || "Agent"})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3">System Identity</h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                            <div className="space-y-1">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Application</h5>
                                <p className="text-sm">{ticket.source_app || <span className="text-muted-foreground italic">Direct</span>}</p>
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenant ID</h5>
                                <p className="text-sm">{ticket.tenant_id || <span className="text-muted-foreground italic">None</span>}</p>
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</h5>
                                <p className="text-sm font-mono">{ticket.user_id || <span className="text-muted-foreground italic">None</span>}</p>
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Email</h5>
                                <p className="text-sm">{ticket.user_email || <span className="text-muted-foreground italic">None</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
