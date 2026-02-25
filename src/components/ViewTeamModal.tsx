import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
};

interface ViewTeamModalProps {
    member: TeamMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ViewTeamModal({ member, isOpen, onClose }: ViewTeamModalProps) {
    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex justify-between items-start gap-4 pr-6">
                        <DialogTitle className="text-xl font-bold leading-tight flex-1">
                            {member.name}
                        </DialogTitle>
                        <Badge variant={member.is_active ? "default" : "secondary"} className={
                            member.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                        }>
                            {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs font-mono mt-1">
                        ID: {member.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</h4>
                            <p className="text-sm">{member.email}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Role</h4>
                            <p className="text-sm">
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 px-2 py-1 rounded-full text-xs font-semibold">
                                    {member.role || "Agent"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
