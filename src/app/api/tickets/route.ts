import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const tickets = await prisma.ticket.findMany({
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
      ticket = await prisma.ticket.create({
        data: {
          title,
          description,
          priority: priority || 'Medium',
          category,
          creatorId: (user as any).userId,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2031') {
        const timestamp = new Date().toISOString();
        await (prisma as any).$runCommandRaw({
          insert: 'Ticket',
          documents: [{
            title,
            description,
            status: 'Open',
            priority: priority || 'Medium',
            category,
            creatorId: { "$oid": (user as any).userId },
            createdAt: { "$date": timestamp },
            updatedAt: { "$date": timestamp }
          }]
        });
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

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updates,
    });

    // Log status change
    if (updates.status && oldTicket.status !== updates.status) {
      await prisma.activityLog.create({
        data: {
          type: 'TICKET_STATUS_CHANGED',
          details: `Ticket status moved from ${oldTicket.status} to ${updates.status}`,
          userId: (user as any).userId,
          ticketId: ticket.id
        }
      });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
