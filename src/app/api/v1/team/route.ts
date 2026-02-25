import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { created_at: 'desc' },
            take: 100, // Matching FastAPI skip/limit defaults
        });

        return NextResponse.json(teamMembers);
    } catch (error) {
        console.error("Failed to fetch team members", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const id = uuidv4();

        // The name and email and role come from the request body
        const newMember = await prisma.teamMember.create({
            data: {
                id,
                name: body.name,
                email: body.email,
                role: body.role,
            }
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error: unknown) {
        console.error("Failed to create team member", error);
        // Rough equivalent of FastAPI catching IntegrityError for unique constraints
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        if (err.code === 'P2002') {
            return NextResponse.json({ detail: "Email already registered." }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create team member" }, { status: 400 });
    }
}
