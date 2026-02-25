import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const totalTickets = await prisma.ticket.count();

        const statusCounts = await prisma.ticket.groupBy({
            by: ['status'],
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

        const openTickets = statusCounts.find(s => s.status === 'OPEN')?._count.id || 0;
        const closedTickets = statusCounts.find(s => s.status === 'CLOSED')?._count.id || 0;

        const priorityBreakdown: Record<string, number> = {};
        priorityCounts.forEach(p => {
            priorityBreakdown[p.priority] = p._count.id;
        });

        return NextResponse.json({
            total_tickets: totalTickets,
            open_tickets: openTickets,
            closed_tickets: closedTickets,
            priority_breakdown: priorityBreakdown,
        });
    } catch (error) {
        console.error("Failed to fetch report summary", error);
        return NextResponse.json({ error: "Failed to fetch report summary" }, { status: 500 });
    }
}
