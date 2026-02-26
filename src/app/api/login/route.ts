import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    // Find the user in the team members table (using name or email as "username")
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ]
      }
    });

    if (teamMember) {
      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: teamMember.id,
            username: teamMember.name,
            role: teamMember.role
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid credentials or user not found" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
