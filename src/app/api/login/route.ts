import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const validEmail = process.env.AUTH_EMAIL || process.env.AUTH_USERNAME;
    const validPassword = process.env.AUTH_PASSWORD;

    if (email === validEmail && password === validPassword) {
      // Sync user to database
      let user = await prisma.user.findFirst({
        where: { email: validEmail }
      });

      if (!user) {
        // Safe creation that handles MongoDB replica set constraints
        try {
          user = await prisma.user.create({
            data: {
              email: validEmail as string,
              password: "env_managed",
              name: "Administrator"
            }
          });
        } catch (error: any) {
          // Fallback for non-replica set MongoDB (P2031)
          if (error.code === 'P2031') {
            await (prisma as any).$runCommandRaw({
              insert: 'User',
              documents: [{
                email: validEmail,
                password: 'env_managed',
                name: 'Administrator'
              }]
            });
            user = await prisma.user.findFirst({
              where: { email: validEmail }
            });
          } else {
            throw error;
          }
        }
      }

      if (!user) throw new Error("Failed to sync user after creation attempt");

      // Issue token
      const token = await signToken({ userId: user.id, email: user.email });

      return NextResponse.json(
        { 
          message: "Login successful", 
          user: { id: user.id, email: user.email, name: user.name },
          token 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
