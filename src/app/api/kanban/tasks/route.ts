import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");

    if (!boardId) return NextResponse.json({ message: "Board ID required" }, { status: 400 });

    const tasks = await prisma.task.findMany({
      where: { boardId },
      orderBy: { order: "asc" }
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, description, status, boardId } = await request.json();

    if (!title) return NextResponse.json({ message: "Title is required" }, { status: 400 });
    if (!boardId) return NextResponse.json({ message: "Board ID is required" }, { status: 400 });

    let task;
    try {
      task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || "To Do",
          boardId,
          order: 0
        }
      });
    } catch (error: any) {
      console.error("Prisma Task Creation Error:", error);
      
      // Fallback for non-replica set MongoDB (P2031)
      if (error.code === 'P2031' || error.message.includes('transaction')) {
        const timestamp = new Date().toISOString();
        try {
          await (prisma as any).$runCommandRaw({
            insert: 'Task',
            documents: [{
              title,
              description,
              status: status || "To Do",
              boardId: { "$oid": boardId },
              order: 0,
              createdAt: { "$date": timestamp }
            }]
          });
          task = await prisma.task.findFirst({
            where: { title, boardId },
            orderBy: { createdAt: "desc" }
          });
        } catch (rawError: any) {
          console.error("Raw MongoDB Fallback Error:", rawError);
          throw rawError;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id, ...updates } = await request.json();

    const task = await prisma.task.update({
      where: { id },
      data: updates
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
