import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTicketAssignmentNotification, sendTicketCompletionNotification } from "@/lib/notification";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const ticketId = (await context.params).id;
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                attachments: true,
                team_member: true
            }
        });

        if (!ticket) {
            return NextResponse.json({ detail: "Ticket not found" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch {
        return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const ticketId = (await context.params).id;
        const body = await request.json();

        const existingTicket = await prisma.ticket.findUnique({
            where: { id: ticketId },
        });

        if (!existingTicket) {
            return NextResponse.json({ detail: "Ticket not found" }, { status: 404 });
        }

        // Only update fields provided in the body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        const allowedFields = ['title', 'description', 'state', 'priority', 'assigned_to', 'type', 'epic_link'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (body.story_points !== undefined) {
            updateData.story_points = body.story_points ? parseInt(body.story_points.toString(), 10) : null;
        }
        if (body.labels !== undefined) {
            updateData.labels = Array.isArray(body.labels) ? body.labels : (typeof body.labels === "string" ? body.labels.split(",").map((l: string) => l.trim()).filter(Boolean) : []);
        }
        if (body.due_date !== undefined) {
            updateData.due_date = body.due_date ? new Date(body.due_date) : null;
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                team_member: true,
            }
        });

        // Trigger notification ONLY if assigned_to was changed to a new person
        if ("assigned_to" in updateData && updateData.assigned_to !== existingTicket.assigned_to && updateData.assigned_to !== null) {
            if (updatedTicket.team_member) {
                sendTicketAssignmentNotification(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    updatedTicket as any,
                    updatedTicket.team_member.name,
                    updatedTicket.team_member.email
                );
            }
        }

        // Trigger notification ONLY if state was changed to a completed state
        if ("state" in updateData && updateData.state !== existingTicket.state) {
            if (updateData.state === "CLOSED" || updateData.state === "COMPLETED") {
                sendTicketCompletionNotification(updatedTicket);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { team_member, ...responseTicket } = updatedTicket;
        return NextResponse.json(responseTicket);
    } catch (error) {
        console.error("Failed to update ticket", error);
        return NextResponse.json({ detail: "Failed to update ticket" }, { status: 400 });
    }
}

