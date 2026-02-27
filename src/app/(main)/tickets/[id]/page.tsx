"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileIcon, ImageIcon, ExternalLink, ChevronDown, CircleDashed, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Attachment = {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    createdAt: string;
};

type Ticket = {
    id: string;
    title: string;
    description: string;
    state: "OPEN" | "IN_PROGRESS" | "UNDER_PROGRESS" | "COMPLETED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    user_email: string | null;
    user_id: string | null;
    tenant_id: string | null;
    source_app: string | null;
    type: "BUG" | "TASK" | "STORY" | "EPIC";
    story_points: number | null;
    labels: string[];
    due_date: string | null;
    epic_link: string | null;
    created_at: string;
    attachments: Attachment[];
    team_member?: { name: string; email: string };
};

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-1.5 gap-1 sm:gap-4 group">
        <div className="w-[130px] shrink-0 text-sm font-semibold text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground flex-1 min-w-0">{value}</div>
    </div>
);

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await fetch(`/api/v1/tickets/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTicket(data);
                } else {
                    toast.error("Ticket not found");
                    router.push("/tickets");
                }
            } catch (error) {
                console.error("Failed to fetch ticket", error);
                toast.error("Failed to load ticket details");
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id, router]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading ticket details...</div>;
    }

    if (!ticket) return null;

    const priorityColors = {
        LOW: "bg-gray-100 text-gray-800",
        MEDIUM: "bg-blue-100 text-blue-800",
        HIGH: "bg-red-100 text-red-800"
    };

    const stateColors = {
        OPEN: "bg-yellow-100 text-yellow-800 border-yellow-200",
        IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
        UNDER_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
        COMPLETED: "bg-purple-100 text-purple-800 border-purple-200",
        CLOSED: "bg-green-100 text-green-800 border-green-200"
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-slate-50/10 min-h-[calc(100vh-80px)]">
            <nav className="flex items-center text-sm font-medium text-muted-foreground mb-6">
                <Link href="/tickets" className="hover:underline">Tickets</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{ticket.id.split('-')[0]}</span>
            </nav>

            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 leading-snug">{ticket.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 shadow-sm font-semibold text-slate-700 border-slate-200"><FileIcon className="w-4 h-4 mr-2" /> Attach</Button>
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 shadow-sm font-semibold text-slate-700 border-slate-200"><CircleDashed className="w-4 h-4 mr-2" /> Link issue</Button>
                    </div>

                    <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {ticket.description || <span className="text-muted-foreground italic">No description provided.</span>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg">Attachments</CardTitle>
                            <Badge variant="secondary" className="font-mono">{ticket.attachments.length}</Badge>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {ticket.attachments.length === 0 ? (
                                <p className="text-muted-foreground text-sm text-center py-4">No attachments for this ticket.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ticket.attachments.map((file) => {
                                        const isExternal = file.fileType === "image/external";
                                        const isImage = file.fileType.startsWith("image/");

                                        return (
                                            <div key={file.id} className="border rounded-lg p-4 flex flex-col gap-3 hover:bg-muted/30 transition-colors shadow-sm bg-card">
                                                <div className="flex items-center gap-3">
                                                    {isImage ? <ImageIcon className="w-5 h-5 text-blue-500" /> : <FileIcon className="w-5 h-5 text-orange-500" />}
                                                    <span className="font-medium truncate text-sm" title={file.fileName}>
                                                        {file.fileName}
                                                    </span>
                                                </div>

                                                {isImage && (
                                                    <div className="relative aspect-video rounded-md overflow-hidden border bg-black/5">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={file.fileName}
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-auto flex flex-col gap-2 pt-2">
                                                    {(isExternal || file.fileType === "application/pdf") && (
                                                        <Button variant="secondary" size="sm" className="w-full gap-2 text-xs" asChild>
                                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-3.5 h-3.5" /> View Document
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs" asChild>
                                                        <a href={file.fileUrl} download={file.fileName}>
                                                            <Download className="w-3.5 h-3.5" /> Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-8">
                    {/* Status Dropdown block */}
                    <div>
                        <Button variant="outline" className={`w-auto font-bold uppercase text-[11px] tracking-wider justify-between border shadow-sm ${stateColors[ticket.state]}`}>
                            {ticket.state.replace('_', ' ')}
                            <ChevronDown className="w-3.5 h-3.5 ml-3 opacity-70" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Details Panel */}
                        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <CardTitle className="text-md">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-1">
                                <DetailRow label="Assignee" value={
                                    <span className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                            {ticket.team_member?.name ? ticket.team_member.name[0].toUpperCase() : "?"}
                                        </div>
                                        <span className={ticket.team_member?.name ? "text-blue-600 hover:underline cursor-pointer" : "text-muted-foreground"}>
                                            {ticket.team_member?.name || "Unassigned"}
                                        </span>
                                    </span>
                                } />
                                <DetailRow label="Reporter" value={
                                    <span className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">
                                            {ticket.user_email ? ticket.user_email[0].toUpperCase() : "?"}
                                        </div>
                                        {ticket.user_email || "N/A"}
                                    </span>
                                } />
                                <DetailRow label="Issue Type" value={
                                    <Badge variant="outline" className={`font-bold px-1.5 py-0 text-[10px] ${ticket.type === "BUG" ? "bg-red-50 text-red-700 border-red-200" :
                                        ticket.type === "STORY" ? "bg-green-50 text-green-700 border-green-200" :
                                            ticket.type === "EPIC" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                "bg-blue-50 text-blue-700 border-blue-200"
                                        }`}>
                                        {ticket.type || "TASK"}
                                    </Badge>
                                } />
                                <DetailRow label="Priority" value={
                                    <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${priorityColors[ticket.priority]}`}>
                                        {ticket.priority}
                                    </Badge>
                                } />
                                <DetailRow label="Labels" value={
                                    <div className="flex flex-wrap gap-1">
                                        {ticket.labels && ticket.labels.length > 0 ? (
                                            ticket.labels.map(label => (
                                                <Badge key={label} variant="secondary" className="px-1.5 py-0 text-xs font-normal">
                                                    {label}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground italic text-xs">None</span>
                                        )}
                                    </div>
                                } />

                                <DetailRow label="Story Points" value={
                                    <span className="font-semibold text-xs">{ticket.story_points ?? <span className="text-muted-foreground font-normal italic">None</span>}</span>
                                } />

                                <DetailRow label="Due Date" value={
                                    ticket.due_date ? new Date(ticket.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : <span className="text-muted-foreground italic text-xs">None</span>
                                } />

                                {ticket.epic_link && (
                                    <DetailRow label="Epic Link" value={
                                        <span className="text-purple-600 hover:underline cursor-pointer font-medium text-xs">{ticket.epic_link}</span>
                                    } />
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional System Info */}
                        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <CardTitle className="text-md">System Routing</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-1">
                                <DetailRow label="Source" value={<span className="text-xs">{ticket.source_app || "Manual Entry"}</span>} />
                                <DetailRow label="Tenant ID" value={<span className="font-mono text-[11px]">{ticket.tenant_id || "N/A"}</span>} />
                                <DetailRow label="User ID" value={<span className="font-mono text-[11px]">{ticket.user_id || "N/A"}</span>} />
                            </CardContent>
                        </Card>

                        <div className="text-[11px] text-muted-foreground pt-4 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Created {new Date(ticket.created_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
