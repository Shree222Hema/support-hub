import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const totalTickets = await prisma.ticket.count();

        const stateCounts = await prisma.ticket.groupBy({
            by: ['state'],
            _count: {
                id: true,
            },
        });

        const priorityCounts = await prisma.ticket.groupBy({
            by: ['priority'],
            _count: {
                id: true,
            },
        });

        const stateBreakdown: Record<string, number> = {
            OPEN: 0,
            IN_PROGRESS: 0,
            UNDER_PROGRESS: 0,
            COMPLETED: 0,
            CLOSED: 0
        };
        stateCounts.forEach(s => {
            stateBreakdown[s.state] = s._count.id;
        });

        const priorityBreakdown: Record<string, number> = {};
        priorityCounts.forEach(p => {
            priorityBreakdown[p.priority] = p._count.id;
        });

        return NextResponse.json({
            total_tickets: totalTickets,
            state_breakdown: stateBreakdown,
            priority_breakdown: priorityBreakdown,
            // Keep legacy fields for backward compatibility if needed, but updated
            open_tickets: stateBreakdown.OPEN,
            closed_tickets: stateBreakdown.CLOSED,
        });
    } catch (error) {
        console.error("Failed to fetch report summary", error);
        return NextResponse.json({ error: "Failed to fetch report summary" }, { status: 500 });
    }
}
