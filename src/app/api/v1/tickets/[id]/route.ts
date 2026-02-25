import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTicketAssignmentNotification } from "@/lib/notification";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const ticketId = (await context.params).id;
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
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
        const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to'];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { team_member, ...responseTicket } = updatedTicket;
        return NextResponse.json(responseTicket);
    } catch (error) {
        console.error("Failed to update ticket", error);
        return NextResponse.json({ detail: "Failed to update ticket" }, { status: 400 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const ticketId = (await context.params).id;

        // Check if ticket exists first
        const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            return NextResponse.json({ detail: "Ticket not found" }, { status: 404 });
        }

        await prisma.ticket.delete({
            where: { id: ticketId },
        });

        // 204 No Content for successful deletion (same as FastAPI)
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete ticket", error);
        return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
    }
}
