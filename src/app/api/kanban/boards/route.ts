import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (user as any).userId;
    let boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { memberIds: { has: userId } }
        ]
      }
    });

    // Auto-seeding: If no boards exist for the user, create a default one
    if (boards.length === 0) {
      try {
        const boardName = "Support Operations";
        // Attempt standard create
        const newBoard = await prisma.board.create({
          data: {
            name: boardName,
            ownerId: userId,
          }
        });
        boards = [newBoard];
      } catch (error: any) {
        // Fallback for non-replica set MongoDB (P2031)
        if (error.code === 'P2031') {
          await (prisma as any).$runCommandRaw({
            insert: 'Board',
            documents: [{
              name: "Support Operations",
              ownerId: { "$oid": userId },
              memberIds: [],
              createdAt: { "$date": new Date().toISOString() }
            }]
          });
          boards = await prisma.board.findMany({
            where: { ownerId: userId }
          });
        } else {
          throw error;
        }
      }
    }

    return NextResponse.json(boards);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
