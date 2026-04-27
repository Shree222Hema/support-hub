import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // [DIAGNOSTIC] Check if the database is pointing to localhost on Vercel
    if (process.env.VERCEL && process.env.DATABASE_URL?.includes('127.0.0.1')) {
       return NextResponse.json(
        { message: "Configuration Error: DATABASE_URL is pointing to localhost. Please set a production MongoDB Atlas URL in Vercel settings." },
        { status: 500 }
      );
    }

    // [EDUCATIONAL] Demo Fallback: Use hardcoded values if environment variables are missing on Vercel.
    // This ensures your project demonstration works out-of-the-box.
    const validEmail = process.env.AUTH_EMAIL || process.env.AUTH_USERNAME || "test@example.com";
    const validPassword = process.env.AUTH_PASSWORD || "password1166";

    let user = null;
    let isLoginSuccessful = false;

    // 1. Check if it's the Administrator
    if (email === validEmail && password === validPassword) {
      isLoginSuccessful = true;
      // Sync/Get admin user from DB
      user = await prisma.user.findFirst({ where: { email: validEmail } });
      
      if (!user) {
        try {
          user = await prisma.user.create({
            data: { email: validEmail, password: "env_managed", name: "Administrator", role: "ADMIN" } as any
          });
        } catch (error: any) {
          if (error.code === 'P2031') {
            await (prisma as any).$runCommandRaw({
              insert: 'User',
              documents: [{ email: validEmail, password: 'env_managed', name: 'Administrator', role: 'ADMIN' }]
            });
            user = await prisma.user.findFirst({ where: { email: validEmail } });
          }
        }
      }
    } 
    // 2. Check if it's a regular user (via DB)
    else {
      user = await prisma.user.findFirst({ where: { email, password } });
      
      // [EDUCATIONAL] Auto-setup for testing: If logging in with the test user and they don't exist, create them.
      // This ensures your Vercel deployment works immediately without manual seeding.
      if (!user && email === 'user@example.com' && password === 'password1166') {
        try {
          user = await prisma.user.create({
            data: { email: 'user@example.com', password: 'password1166', name: 'Regular User', role: 'USER' } as any
          });
          isLoginSuccessful = true;
        } catch (error: any) {
          if (error.code === 'P2031') {
             await (prisma as any).$runCommandRaw({
              insert: 'User',
              documents: [{ email: 'user@example.com', password: 'password1166', name: 'Regular User', role: 'USER' }]
            });
            user = await prisma.user.findFirst({ where: { email: 'user@example.com' } });
            isLoginSuccessful = true;
          }
        }
      } else if (user) {
        isLoginSuccessful = true;
      }
    }

    if (isLoginSuccessful && user) {
      const token = await signToken({ 
        userId: user.id, 
        email: user.email, 
        role: (user as any).role || "USER" 
      });

      return NextResponse.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: (user as any).role || "USER"
        },
        token 
      }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    // [DEBUG] Return the actual error message to help troubleshooting on Vercel
    return NextResponse.json(
      { message: `Server Error: ${error.message || "Unknown error"}. Check if your DATABASE_URL is correct in Vercel settings.` },
      { status: 500 }
    );
  }
}
