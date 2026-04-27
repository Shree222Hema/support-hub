import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const where: any = {};
    if (user.role !== 'ADMIN') {
      where.OR = [
        { creatorId: user.userId },
        { assigneeId: user.userId }
      ];
    }

    const [categoryGroup, priorityGroup] = await Promise.all([
      prisma.ticket.groupBy({
        where,
        by: ['category'],
        _count: { _all: true }
      }),
      prisma.ticket.groupBy({
        where,
        by: ['priority'],
        _count: { _all: true }
      })
    ]);

    const categories = categoryGroup.map(c => ({
      name: c.category || 'Uncategorized',
      value: c._count._all
    }));

    const priorities = priorityGroup.map(p => ({
      name: p.priority,
      value: p._count._all
    }));

    return NextResponse.json({ categories, priorities });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
