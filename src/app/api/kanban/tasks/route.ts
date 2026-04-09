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

    let task;
    try {
      task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || "To Do",
          boardId,
          order: 0 // Simplification for now
        }
      });
    } catch (error: any) {
      if (error.code === 'P2031') {
        const timestamp = new Date().toISOString();
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
