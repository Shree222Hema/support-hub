"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileIcon, ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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
    created_at: string;
    attachments: Attachment[];
    team_member?: { name: string; email: string };
};

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
        OPEN: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        UNDER_PROGRESS: "bg-orange-100 text-orange-800",
        COMPLETED: "bg-purple-100 text-purple-800",
        CLOSED: "bg-green-100 text-green-800"
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2 -ml-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Tickets
            </Button>

            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{ticket.title}</h1>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>ID: {ticket.id}</span>
                        <span>•</span>
                        <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={stateColors[ticket.state]}>{ticket.state.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-lg leading-relaxed">
                            {ticket.description}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Attachments ({ticket.attachments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ticket.attachments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No attachments for this ticket.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ticket.attachments.map((file) => {
                                        const isExternal = file.fileType === "image/external";
                                        const isImage = file.fileType.startsWith("image/");

                                        return (
                                            <div key={file.id} className="border rounded-lg p-4 flex flex-col gap-3 bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    {isImage ? <ImageIcon className="w-5 h-5 text-blue-500" /> : <FileIcon className="w-5 h-5 text-orange-500" />}
                                                    <span className="font-medium truncate text-sm" title={file.fileName}>
                                                        {file.fileName}
                                                    </span>
                                                </div>

                                                {isImage && (
                                                    <div className="relative aspect-video rounded-md overflow-hidden border bg-white">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={file.fileName}
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-auto flex flex-col gap-2">
                                                    {(isExternal || file.fileType === "application/pdf") && (
                                                        <Button variant="secondary" size="sm" className="w-full gap-2" asChild>
                                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4" />
                                                                View Document
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                                                        <a href={file.fileUrl} download={file.fileName}>
                                                            <Download className="w-4 h-4" />
                                                            Download
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

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reporter (Email)</label>
                                <p className="font-medium">{ticket.user_email || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User ID</label>
                                <p className="font-medium font-mono text-sm">{ticket.user_id || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenant ID</label>
                                <p className="font-medium font-mono text-sm">{ticket.tenant_id || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Application</label>
                                <p className="font-medium">{ticket.source_app || "Manual Entry"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Agent</label>
                                <p className="font-medium text-blue-600">{ticket.team_member?.name || "Unassigned"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
