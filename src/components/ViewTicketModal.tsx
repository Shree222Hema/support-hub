import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Ticket = {
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

interface ViewTicketModalProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ViewTicketModal({ ticket, isOpen, onClose }: ViewTicketModalProps) {
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
                            <Badge variant={ticket.status === "OPEN" ? "default" : "secondary"} className={
                                ticket.status === "OPEN"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500"
                                    : "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
                            }>
                                {ticket.status}
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
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</h4>
                                <p className="text-sm font-mono">{ticket.assigned_to || "Unassigned"}</p>
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
