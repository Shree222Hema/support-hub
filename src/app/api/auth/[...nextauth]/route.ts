import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Name or Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Credentials not provided");
                }

                const teamMember = await prisma.teamMember.findFirst({
                    where: {
                        OR: [
                            { email: credentials.username },
                            { name: credentials.username }
                        ]
                    }
                });

                if (!teamMember || !teamMember.password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(credentials.password, teamMember.password)

                if (passwordsMatch) {
                    return {
                        id: teamMember.id,
                        name: teamMember.name,
                        email: teamMember.email,
                        role: teamMember.role,
                    };
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', // Redirect here if auth fails
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
