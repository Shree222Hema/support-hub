import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch tickets created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true }
    });

    // Group by date
    const grouped = tickets.reduce((acc: any, ticket) => {
      const date = ticket.createdAt?.toISOString().split('T')[0] || 'Unknown';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Fill in gaps for the last 7 days at least to ensure a nice chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        count: grouped[dateStr] || 0
      });
    }

    return NextResponse.json(chartData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
