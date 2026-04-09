import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [totalTickets, totalUsers, resolvedTickets, recentTickets] = await Promise.all([
      prisma.ticket.count(),
      prisma.user.count(),
      prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed", "Done"] } } }),
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { name: true, email: true } }
        }
      })
    ]);

    const resolutionRate = totalTickets > 0 
      ? ((resolvedTickets / totalTickets) * 100).toFixed(1) 
      : "0.0";

    return NextResponse.json({
      totalTickets,
      totalUsers,
      resolutionRate,
      recentTickets,
      // Mocking some deltas for visual effect as we don't have historical data yet
      deltas: {
        tickets: "+12%",
        users: "+3%",
        resolution: "+2.1%"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
