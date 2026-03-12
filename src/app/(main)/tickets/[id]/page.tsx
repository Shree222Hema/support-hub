"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download, FileIcon, ImageIcon, ExternalLink, ChevronDown,
    CircleDashed, Clock, CheckSquare, Settings2, User2, Zap, Link as LinkIcon,
    Paperclip, LayoutGrid, MessageSquare, History, Activity, AlertCircle, BookmarkIcon
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

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

const JiraDetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex items-center min-h-[32px] group hover:bg-slate-50 -mx-1 px-1 rounded transition-colors">
        <div className="w-[124px] shrink-0 text-[13px] font-medium text-slate-500">{label}</div>
        <div className="flex-1 min-w-0 text-[13px] text-slate-800 flex items-center">{value}</div>
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

    const TicketIcon = () => {
        switch (ticket.type) {
            case "BUG": return <AlertCircle className="w-4 h-4 text-red-500 rounded bg-red-50 p-0.5" />;
            case "STORY": return <BookmarkIcon className="w-4 h-4 text-green-500 rounded bg-green-50 p-0.5" />;
            case "EPIC": return <Zap className="w-4 h-4 text-purple-500 rounded bg-purple-50 p-0.5" />;
            default: return <CheckSquare className="w-4 h-4 text-blue-500 rounded bg-blue-50 p-0.5" />;
        }
    };

    return (
        <div className="bg-white min-h-[calc(100vh-60px)] pt-8 pb-32">
            <div className="max-w-[1100px] mx-auto px-6">

                {/* Header Breadcrumb Jira Style */}
                <div className="flex gap-2 text-[14px] text-slate-500 mb-6 items-center">
                    <Link href="/tickets" className="flex items-center gap-2 hover:underline text-slate-600">
                        <LayoutGrid className="w-4 h-4 text-slate-400" />
                        Projects / Support Hub
                    </Link>
                    <span className="mx-1">/</span>
                    <span className="flex items-center gap-1.5 cursor-pointer hover:underline text-slate-600">
                        <TicketIcon />
                        {ticket.id.split('-')[0]}
                    </span>
                </div>

                <div className="mb-6">
                    <h1 className="text-[24px] font-semibold text-[#172b4d] tracking-tight leading-snug">{ticket.title}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-10">
                    {/* LEFT COLUMN - Main Content */}
                    <div className="max-w-[700px]">

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-2 mb-8">
                            <Button variant="ghost" size="sm" className="h-8 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-medium">
                                <Paperclip className="w-4 h-4 mr-2 text-slate-500" /> Attach
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-medium">
                                <LinkIcon className="w-4 h-4 mr-2 text-slate-500" /> Link issue
                            </Button>
                        </div>

                        {/* Description Section */}
                        <div className="mb-10">
                            <h2 className="text-[15px] font-semibold text-[#172b4d] mb-4">Description</h2>
                            {ticket.description ? (
                                <div className="text-[14.5px] text-[#172b4d]/90 leading-relaxed whitespace-pre-wrap py-2 hover:bg-slate-50/50 rounded-md transition-colors px-1 -mx-1">
                                    {ticket.description}
                                </div>
                            ) : (
                                <div className="text-[14px] text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors p-3 rounded-md cursor-pointer border border-transparent hover:border-slate-200 align-middle">
                                    Add a description...
                                </div>
                            )}
                        </div>

                        {/* Attachments Section */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[15px] font-semibold text-[#172b4d]">Attachments</h2>
                                {ticket.attachments.length > 0 && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ticket.attachments.length}</span>}
                            </div>

                            {ticket.attachments.length === 0 ? (
                                <div className="text-[14px] text-slate-500 bg-slate-50 p-6 rounded-md border border-dashed text-center">
                                    Drop files here to attach
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ticket.attachments.map((file) => {
                                        const isExternal = file.fileType === "image/external";
                                        const isImage = file.fileType.startsWith("image/");
                                        const isVideo = file.fileType.startsWith("video/");

                                        return (
                                            <div key={file.id} className="border rounded-md p-3 flex flex-col gap-3 group hover:shadow-sm transition-shadow bg-white">
                                                <div className="flex items-center gap-2">
                                                    {isImage ? <ImageIcon className="w-4 h-4 text-blue-500" /> : isVideo ? <FileIcon className="w-4 h-4 text-purple-500" /> : <FileIcon className="w-4 h-4 text-orange-500" />}
                                                    <span className="font-medium truncate text-[13px] text-slate-700 flex-1" title={file.fileName}>
                                                        {file.fileName}
                                                    </span>
                                                </div>

                                                {isImage && (
                                                    <div className="relative aspect-video rounded overflow-hidden border bg-slate-50 mt-1">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={file.fileUrl}
                                                            alt={file.fileName}
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                )}

                                                {isVideo && (
                                                    <div className="relative aspect-video rounded overflow-hidden border bg-black mt-1">
                                                        <video
                                                            src={file.fileUrl}
                                                            controls
                                                            className="object-contain w-full h-full"
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-auto flex flex-col gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex gap-2">
                                                        {(isExternal || file.fileType === "application/pdf") && (
                                                            <Button variant="secondary" size="sm" className="h-7 flex-1 text-xs bg-slate-100" asChild>
                                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                    View
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="sm" className="h-7 flex-1 text-xs" asChild>
                                                            <a href={file.fileUrl} download={file.fileName}>
                                                                <Download className="w-3.5 h-3.5 mr-1" /> Download
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Activity Tabs (Mockup like Jira) */}
                        <div className="mb-8">
                            <h2 className="text-[15px] font-semibold text-[#172b4d] mb-4">Activity</h2>
                            <div className="flex items-center gap-1 border-b border-slate-200 mb-6 pb-[1px]">
                                <div className="text-[13.5px] font-semibold bg-blue-50/50 text-blue-700 border-b-2 border-blue-600 px-3 py-1.5 -mb-[2px] cursor-pointer">All</div>
                                <div className="text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-sm cursor-pointer transition-colors">Comments</div>
                                <div className="text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-sm cursor-pointer transition-colors">History</div>
                                <div className="text-[13.5px] font-medium text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-sm cursor-pointer transition-colors">Work log</div>
                            </div>

                            {/* Empty Activity State */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User2 className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="flex-1 border rounded-md shadow-sm">
                                    <div className="p-3 text-[14px] text-slate-400 cursor-pointer">
                                        Add a comment...
                                    </div>
                                    <div className="bg-slate-50 border-t p-2 flex justify-between items-center rounded-b-md">
                                        <div className="text-xs font-semibold text-slate-500 px-2">Pro tip: press <kbd className="bg-white border rounded px-1 shadow-sm font-sans">m</kbd> to comment</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - Sidebar */}
                    <div className="space-y-4">

                        {/* Status Dropdown Group */}
                        <div className="flex items-center gap-1.5 mb-6">
                            <Button variant="secondary" className="h-[32px] bg-slate-100 hover:bg-slate-200 text-[#172b4d] font-semibold text-[12px] uppercase tracking-wider justify-between min-w-[130px] shadow-sm border border-slate-200">
                                <span>{ticket.state.replace('_', ' ')}</span>
                                <ChevronDown className="w-3.5 h-3.5 ml-2 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-[32px] w-[32px] hover:bg-slate-100 border border-transparent shadow-sm"><Zap className="w-4 h-4 text-slate-600" /></Button>
                        </div>

                        {/* Details Panel - EXACT Jira accordion match */}
                        <div className="border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
                            {/* Panel Header */}
                            <div className="flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-transparent hover:border-slate-100" onClick={(e) => {
                                const content = e.currentTarget.nextElementSibling;
                                if (content) content.classList.toggle('hidden');
                                const chevron = e.currentTarget.querySelector('.chevron');
                                if (chevron) chevron.classList.toggle('-rotate-90');
                            }}>
                                <ChevronDown className="chevron w-4 h-4 text-slate-500 mr-2 transition-transform duration-200" />
                                <span className="text-[14px] font-semibold text-[#172b4d]">Details</span>
                                <Settings2 className="w-[14px] h-[14px] text-slate-400 ml-auto hover:text-slate-600" />
                            </div>

                            {/* Panel Content (Rows) */}
                            <div className="px-4 py-2 pb-4 space-y-1">
                                <JiraDetailRow label="Assignee"
                                    value={
                                        <div className="flex items-center gap-2 group cursor-pointer w-full">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                {ticket.team_member?.name ? <span className="text-xs font-bold text-slate-600">{ticket.team_member.name[0]}</span> : <User2 className="w-[14px] h-[14px] text-slate-400" />}
                                            </div>
                                            {ticket.team_member?.name ? (
                                                <span className="hover:underline">{ticket.team_member.name}</span>
                                            ) : (
                                                <span className="text-blue-600 font-medium hover:underline">Unassigned</span>
                                            )}
                                        </div>
                                    }
                                />

                                <JiraDetailRow label="Labels"
                                    value={ticket.labels && ticket.labels.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {ticket.labels.map(l => <span key={l} className="bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-sm text-slate-700 cursor-pointer">{l}</span>)}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 hover:bg-slate-100 px-1.5 p-0.5 rounded cursor-pointer -ml-1">None</span>
                                    )}
                                />

                                <JiraDetailRow label="Parent" value={<span className="text-slate-500 hover:bg-slate-100 px-1.5 p-0.5 rounded cursor-pointer -ml-1">None</span>} />

                                <JiraDetailRow label="Due date" value={ticket.due_date ? format(new Date(ticket.due_date), "MMM d, yyyy") : <span className="text-slate-500 hover:bg-slate-100 px-1.5 p-0.5 rounded cursor-pointer -ml-1">None</span>} />

                                <JiraDetailRow label="Story Points" value={ticket.story_points ? <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">{ticket.story_points}</span> : <span className="text-slate-500 hover:bg-slate-100 px-1.5 p-0.5 rounded cursor-pointer -ml-1">None</span>} />

                                <JiraDetailRow label="Reporter"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border flex items-center justify-center shrink-0">
                                                {ticket.user_email ? <span className="text-[10px] font-bold text-slate-600">{ticket.user_email[0].toUpperCase()}</span> : <User2 className="w-[14px] h-[14px] text-slate-400" />}
                                            </div>
                                            <span className="truncate">{ticket.user_email || "System"}</span>
                                        </div>
                                    }
                                />

                                {ticket.epic_link && (
                                    <JiraDetailRow label="Epic Link" value={<span className="text-purple-600 hover:underline cursor-pointer font-medium px-1 -mx-1 rounded hover:bg-slate-100">{ticket.epic_link}</span>} />
                                )}
                            </div>
                        </div>

                        {/* Extra Panel just to populate the UI realistically */}
                        <div className="border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
                            <div className="flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                <ChevronDown className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-[14px] font-semibold text-[#172b4d]">System App</span>
                            </div>
                            <div className="px-4 py-2 pb-4 space-y-1">
                                <JiraDetailRow label="Source" value={<span>{ticket.source_app || "Manual"}</span>} />
                                <JiraDetailRow label="Tenant ID" value={<span className="font-mono text-xs">{ticket.tenant_id || "None"}</span>} />
                            </div>
                        </div>

                        {/* Created / Updated Timestamps */}
                        <div className="text-[12px] text-slate-500 flex justify-between items-start pt-4 px-1">
                            <div className="flex flex-col gap-1">
                                <span>Created {format(new Date(ticket.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                                <span>Updated {format(new Date(ticket.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:underline text-slate-600">
                                <Settings2 className="w-3.5 h-3.5" /> Configure
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
