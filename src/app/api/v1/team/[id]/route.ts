import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const memberId = (await context.params).id;
        const member = await prisma.teamMember.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return NextResponse.json({ detail: "Team member not found" }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch {
        return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const memberId = (await context.params).id;

        // Check if member exists
        const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
        if (!member) {
            return NextResponse.json({ detail: "Team member not found" }, { status: 404 });
        }

        await prisma.teamMember.delete({
            where: { id: memberId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Failed to delete team member", error);
        return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }
}
