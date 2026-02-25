import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendNewTicketNotification, sendTicketAssignmentNotification } from "@/lib/notification";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get("status");

        const tickets = await prisma.ticket.findMany({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: statusFilter ? { status: statusFilter as any } : undefined,
            orderBy: { created_at: 'desc' },
            take: 100, // Matches fastapi limit=100
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Failed to fetch tickets", error);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const id = uuidv4();

        // Set defaults matching Pydantic schema
        const newTicket = await prisma.ticket.create({
            data: {
                id,
                title: body.title,
                description: body.description,
                status: body.status || "OPEN",
                priority: body.priority || "MEDIUM",
                assigned_to: body.assigned_to || null,
                user_id: body.user_id || null,
                tenant_id: body.tenant_id || null,
                user_email: body.user_email || null,
                source_app: body.source_app || null,
            },
            include: {
                team_member: true, // Fetch relation for notification
            }
        });

        // Send notifications mimicking FastAPI ticket service
        if (newTicket.status === "OPEN") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sendNewTicketNotification(newTicket as any);
        }

        if (newTicket.assigned_to && newTicket.team_member) {
            sendTicketAssignmentNotification(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newTicket as any,
                newTicket.team_member.name,
                newTicket.team_member.email
            );
        }

        // Don't send relation data back to keep response identical to FastAPI TicketResponse
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { team_member, ...responseTicket } = newTicket;

        return NextResponse.json(responseTicket, { status: 201 });
    } catch (error) {
        console.error("Failed to create ticket", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 400 });
    }
}
