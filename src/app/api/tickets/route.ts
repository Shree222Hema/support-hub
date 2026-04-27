import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const where: any = {};
    if (user.role !== 'ADMIN') {
      where.OR = [
        { creatorId: user.userId },
        { assigneeId: user.userId }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { title, description, priority, category } = await request.json();

    let ticket;
    try {
      // [EDUCATIONAL] Attempting to create a ticket using standard Prisma ORM methods.
      // High-level ORMs are great but sometimes require specific database configurations (like Replica Sets).
      ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          priority: priority || "Medium",
          category: category || "General",
          creatorId: (user as any).userId,
        },
      });
    } catch (error: any) {
      // [EDUCATIONAL] Fallback logic for standalone MongoDB instances.
      // If the database is NOT a replica set, Prisma transactions fail with error P2031.
      // We bypass this by using a "Raw Command" which talks directly to MongoDB.
      if (error.code === 'P2031') {
        const timestamp = new Date().toISOString();
        await (prisma as any).$runCommandRaw({
          insert: 'Ticket',
          documents: [{
            title,
            description,
            status: 'Open',
            priority: priority || "Medium",
            category: category || "General",
            creatorId: { "$oid": (user as any).userId },
            createdAt: { "$date": timestamp },
            updatedAt: { "$date": timestamp }
          }]
        });
        
        // Fetch the newly inserted ticket to return it
        ticket = await prisma.ticket.findFirst({
          where: { title, creatorId: (user as any).userId },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        throw error;
      }
    }

    if (!ticket) throw new Error("Failed to create ticket");

    // Separately create the log to avoid requiring a MongoDB replica set for transactions
    try {
      await prisma.activityLog.create({
        data: {
          type: 'TICKET_CREATED',
          details: `Ticket "${title}" created`,
          userId: (user as any).userId,
          ticketId: ticket.id
        }
      });
    } catch (error: any) {
      if (error.code === 'P2031') {
        await (prisma as any).$runCommandRaw({
          insert: 'ActivityLog',
          documents: [{
            type: 'TICKET_CREATED',
            details: `Ticket "${title}" created`,
            userId: { "$oid": (user as any).userId },
            ticketId: { "$oid": ticket.id },
            createdAt: { "$date": new Date().toISOString() }
          }]
        });
      }
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, ...updates } = await request.json();
    
    const oldTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!oldTicket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });

    let ticket;
    try {
      ticket = await prisma.ticket.update({
        where: { id },
        data: updates,
      });
    } catch (error: any) {
      if (error.code === 'P2031') {
        await (prisma as any).$runCommandRaw({
          update: 'Ticket',
          updates: [{
            q: { _id: { "$oid": id } },
            u: { "$set": { ...updates, updatedAt: { "$date": new Date().toISOString() } } }
          }]
        });
        ticket = await prisma.ticket.findUnique({ where: { id } });
      } else {
        throw error;
      }
    }

    if (!ticket) throw new Error("Failed to update ticket");

    // Log status change
    if (updates.status && oldTicket.status !== updates.status) {
      try {
        await prisma.activityLog.create({
          data: {
            type: 'TICKET_STATUS_CHANGED',
            details: `Ticket status moved from ${oldTicket.status} to ${updates.status}`,
            userId: (user as any).userId,
            ticketId: ticket.id
          }
        });
      } catch (error: any) {
        if (error.code === 'P2031') {
          await (prisma as any).$runCommandRaw({
            insert: 'ActivityLog',
            documents: [{
              type: 'TICKET_STATUS_CHANGED',
              details: `Ticket status moved from ${oldTicket.status} to ${updates.status}`,
              userId: { "$oid": (user as any).userId },
              ticketId: { "$oid": ticket.id },
              createdAt: { "$date": new Date().toISOString() }
            }]
          });
        }
      }
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
