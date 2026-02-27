import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type TeamMember = {
    id: string;
    name: string;
};

export function CreateTicketModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"BUG" | "TASK" | "STORY" | "EPIC">("TASK");
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
    const [storyPoints, setStoryPoints] = useState<string>("");
    const [labels, setLabels] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assignedTo, setAssignedTo] = useState<string>("none");
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    useEffect(() => {
        if (open) {
            // Fetch team members when modal opens
            fetch("/api/v1/team/")
                .then((res) => res.json())
                .then((data) => setTeamMembers(data))
                .catch((err) => console.error("Failed to fetch team members", err));
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("priority", priority);
            formData.append("type", type);

            if (storyPoints) formData.append("story_points", storyPoints);
            if (labels) formData.append("labels", labels);
            if (dueDate) formData.append("due_date", dueDate);

            if (assignedTo !== "none") {
                formData.append("assigned_to", assignedTo);
            }

            if (files) {
                for (let i = 0; i < files.length; i++) {
                    formData.append("file", files[i]);
                }
            }

            const res = await fetch("/api/v1/tickets/", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setOpen(false);
                setTitle("");
                setDescription("");
                setPriority("MEDIUM");
                setType("TASK");
                setStoryPoints("");
                setLabels("");
                setDueDate("");
                setAssignedTo("none");
                setFiles(null);
                toast.success("Ticket created successfully!");
                onSuccess();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to create ticket");
            }
        } catch (error: unknown) {
            toast.error("An error occurred while creating the ticket");
            console.error("Error creating ticket", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Ticket</DialogTitle>
                        <DialogDescription>
                            Fill out the details below to open a new support ticket.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Brief summary of the issue"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed explanation of the problem..."
                                required
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Issue Type</Label>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Select value={type} onValueChange={(val: any) => setType(val)}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUG">Bug</SelectItem>
                                        <SelectItem value="TASK">Task</SelectItem>
                                        <SelectItem value="STORY">Story</SelectItem>
                                        <SelectItem value="EPIC">Epic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="storyPoints">Story Points</Label>
                                <Input
                                    id="storyPoints"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={storyPoints}
                                    onChange={(e) => setStoryPoints(e.target.value)}
                                    placeholder="e.g. 5"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="labels">Labels</Label>
                                <Input
                                    id="labels"
                                    value={labels}
                                    onChange={(e) => setLabels(e.target.value)}
                                    placeholder="frontend, urgent..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="assignee">Assignee</Label>
                                <Select value={assignedTo} onValueChange={setAssignedTo}>
                                    <SelectTrigger id="assignee">
                                        <SelectValue placeholder="Assign to..." />
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
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="files">Attachments (Max 20MB each)</Label>
                            <Input
                                id="files"
                                type="file"
                                multiple
                                onChange={(e) => setFiles(e.target.files)}
                                accept="image/*,application/pdf"
                                className="cursor-pointer"
                            />
                            {files && files.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {files.length} file(s) selected
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Ticket"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
