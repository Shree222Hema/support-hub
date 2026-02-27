"use client";

import React, { useState } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, rectIntersection, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Ticket } from "@/app/(main)/tickets/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, GripVertical, Paperclip } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface KanbanBoardProps {
    tickets: Ticket[];
    onStateChange: (ticket: Ticket, newState: Ticket["state"]) => Promise<void>;
    onTicketClick: (ticket: Ticket) => void;
}

const STATES: { id: Ticket["state"]; title: string }[] = [
    { id: "OPEN", title: "Open" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "UNDER_PROGRESS", title: "Under Review" },
    { id: "COMPLETED", title: "Completed" },
    { id: "CLOSED", title: "Closed" },
];

export function KanbanBoard({ tickets, onStateChange, onTicketClick }: KanbanBoardProps) {
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px drag to trigger, allows clicking on card links
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const ticket = tickets.find(t => t.id === active.id);
        if (ticket) setActiveTicket(ticket);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveTicket(null);
        const { active, over } = event;

        if (!over) return;

        const ticketId = active.id;
        const newState = over.id as Ticket["state"];
        const ticket = tickets.find(t => t.id === ticketId);

        if (ticket && ticket.state !== newState) {
            // Optimistic hook can be added here, but waiting for API is safer for DB integrity
            await onStateChange(ticket, newState);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-250px)]">
                {STATES.map((state) => (
                    <KanbanColumn
                        key={state.id}
                        state={state}
                        tickets={tickets.filter(t => t.state === state.id)}
                        onTicketClick={onTicketClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTicket ? <KanbanCard ticket={activeTicket} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ state, tickets, onTicketClick }: { state: { id: Ticket["state"]; title: string }, tickets: Ticket[], onTicketClick: (ticket: Ticket) => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id: state.id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col flex-shrink-0 w-80 bg-muted/40 rounded-xl border border-transparent transition-colors ${isOver ? "border-primary/50 bg-primary/5 shadow-inner" : ""
                }`}
        >
            <div className="p-4 flex items-center justify-between border-b bg-background/50 rounded-t-xl">
                <h3 className="font-semibold text-sm tracking-tight">{state.title}</h3>
                <Badge variant="secondary" className="bg-background/80 shadow-sm">{tickets.length}</Badge>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
                {tickets.map(ticket => (
                    <KanbanCard key={ticket.id} ticket={ticket} onTicketClick={onTicketClick} />
                ))}
            </div>
        </div>
    );
}

function KanbanCard({ ticket, isOverlay, onTicketClick }: { ticket: Ticket; isOverlay?: boolean, onTicketClick?: (ticket: Ticket) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ticket.id,
        data: { ticket },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (isDragging && !isOverlay) {
        return (
            <div className="h-32 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 opacity-50" />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group bg-card border rounded-lg shadow-sm w-full text-left overflow-hidden transition-all ${isOverlay ? "rotate-2 shadow-xl ring-2 ring-primary/20 cursor-grabbing" : "hover:shadow-md hover:border-primary/30 cursor-grab"
                }`}
        >
            <div className="p-4 flex gap-2">
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground shrink-0 hidden sm:block">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                        <span
                            className="font-medium text-sm hover:underline line-clamp-2 leading-snug cursor-pointer"
                            onPointerDown={e => e.stopPropagation()}
                            onClick={() => onTicketClick && onTicketClick(ticket)}
                        >
                            {ticket.title}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 border-transparent ${ticket.type === "BUG" ? "bg-red-50 text-red-700 hover:bg-red-50" :
                            ticket.type === "STORY" ? "bg-green-50 text-green-700 hover:bg-green-50" :
                                ticket.type === "EPIC" ? "bg-purple-50 text-purple-700 hover:bg-purple-50" :
                                    "bg-blue-50 text-blue-700 hover:bg-blue-50"
                            }`}>
                            {ticket.type || "TASK"}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 ${ticket.priority === "HIGH" ? "border-red-200 text-red-700 bg-red-50" :
                            ticket.priority === "MEDIUM" ? "border-blue-200 text-blue-700 bg-blue-50" :
                                "border-gray-200 text-gray-700 bg-gray-50"
                            }`}>
                            {ticket.priority}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{ticket.id.split('-')[0]}</span>
                        <div className="flex items-center gap-3">
                            {ticket.story_points && (
                                <Badge variant="secondary" className="px-1.5 font-mono text-[10px]">{ticket.story_points}</Badge>
                            )}
                            {ticket.due_date && (
                                <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-1 rounded-sm">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(ticket.due_date), "MMM d")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
