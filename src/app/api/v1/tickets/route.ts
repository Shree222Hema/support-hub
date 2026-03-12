import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { sendNewTicketNotification, sendTicketAssignmentNotification } from "@/lib/notification";
import { validateApiKey } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4", "video/quicktime", "video/webm"];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const stateFilter = searchParams.get("state");

        // Auth Simulation: Prefer headers, fallback to query params
        const userId = request.headers.get("X-USER-ID") || searchParams.get("user_id");
        const userRole = request.headers.get("X-USER-ROLE") || searchParams.get("role");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (stateFilter && stateFilter !== "ALL") {
            where.state = stateFilter as any;
        }

        // RBAC Implementation:
        // - MANAGER: Can see all tickets.
        // - USER: Can only see their assigned tickets.
        if (userRole === "USER" && userId) {
            where.assigned_to = userId;
        } else if (userRole === "MANAGER") {
            // Managers see all (default where)
        } else if (userRole === "USER" && !userId) {
            // Strict mode: if role is USER but no ID, return nothing or handle error?
            // For now, let's return [] to be safe if they are identified as USER
            return NextResponse.json([]);
        }

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: 100, // Matches fastapi limit=100
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Failed to fetch tickets", error);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    console.log("--- POST /api/v1/tickets/ started ---");
    try {
        const contentType = request.headers.get("content-type") || "";
        console.log("Content-Type:", contentType);

        let body: any = {};
        const attachmentsData: { fileUrl: string; fileName: string; fileType: string }[] = [];

        // API Key Validation: required if x-api-key header exists
        if (request.headers.has("x-api-key")) {
            console.log("Checking API key...");
            if (!validateApiKey(request)) {
                console.warn("Invalid API key provided");
                return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
            }
        }

        if (contentType.includes("multipart/form-data")) {
            console.log("Parsing multipart/form-data...");
            const formData = await request.formData();

            // Extract fields
            body.title = formData.get("title")?.toString();
            body.description = formData.get("description")?.toString();
            body.state = formData.get("state")?.toString() || "OPEN";
            body.priority = formData.get("priority")?.toString() || "MEDIUM";
            body.assigned_to = formData.get("assigned_to")?.toString() || null;
            body.user_id = formData.get("user_id")?.toString() || null;
            body.tenant_id = formData.get("tenant_id")?.toString() || null;
            body.user_email = formData.get("user_email")?.toString() || null;
            body.source_app = formData.get("source_app")?.toString() || null;
            body.type = formData.get("type")?.toString() || null;
            body.story_points = formData.get("story_points")?.toString() || null;
            body.labels = formData.get("labels")?.toString() || null;
            body.due_date = formData.get("due_date")?.toString() || null;
            body.epic_link = formData.get("epic_link")?.toString() || null;

            console.log("Extracted fields:", body);

            // Extract files
            const files = formData.getAll("file") as unknown as File[];
            console.log(`Number of files found: ${files.length}`);

            for (const file of files) {
                // Skip if it's not actually a file object (sometimes happens with empty fields)
                if (!(file instanceof Blob)) {
                    console.log("Skipping non-file field");
                    continue;
                }

                console.log(`Processing file: ${file.name} (${file.size} bytes, ${file.type})`);

                if (file.size > MAX_FILE_SIZE) {
                    console.warn(`File ${file.name} exceeds 20MB limit`);
                    return NextResponse.json({ error: `File ${file.name} exceeds 20MB limit` }, { status: 400 });
                }
                if (!ALLOWED_TYPES.includes(file.type)) {
                    console.warn(`File ${file.name} type not allowed: ${file.type}`);
                    return NextResponse.json({ error: `File ${file.name} type not allowed` }, { status: 400 });
                }

                try {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const fileExtension = path.extname(file.name);
                    const safeFileName = `${uuidv4()}${fileExtension}`;
                    const filePath = path.join(UPLOAD_DIR, safeFileName);

                    await fs.writeFile(filePath, buffer);
                    console.log(`File saved to ${filePath}`);

                    attachmentsData.push({
                        fileUrl: `/uploads/${safeFileName}`,
                        fileName: file.name,
                        fileType: file.type
                    });
                } catch (fileErr) {
                    console.error(`Error saving file ${file.name}:`, fileErr);
                    throw fileErr;
                }
            }
        } else {
            console.log("Parsing JSON body...");
            body = await request.json();

            // If image_url is provided (External App Integration)
            if (body.image_url) {
                console.log("Added external image URL:", body.image_url);
                attachmentsData.push({
                    fileUrl: body.image_url,
                    fileName: "External Image",
                    fileType: "image/external"
                });
            }
        }

        if (!body.title || !body.description) {
            console.warn("Title or description missing");
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const id = uuidv4();
        console.log(`Creating ticket ${id} in database...`);

        const newTicket = await prisma.ticket.create({
            data: {
                id,
                title: body.title,
                description: body.description,
                state: body.state as any || "OPEN",
                priority: body.priority as any || "MEDIUM",
                assigned_to: body.assigned_to || null,
                user_id: body.user_id || null,
                tenant_id: body.tenant_id || null,
                user_email: body.user_email || null,
                source_app: body.source_app || null,
                type: body.type as any || "TASK",
                story_points: body.story_points ? parseInt(body.story_points, 10) : null,
                labels: Array.isArray(body.labels) ? body.labels : (typeof body.labels === "string" ? body.labels.split(",").map((l: string) => l.trim()).filter(Boolean) : []),
                due_date: body.due_date ? new Date(body.due_date) : null,
                epic_link: body.epic_link || null,
                attachments: {
                    create: attachmentsData
                }
            },
            include: {
                team_member: true,
                attachments: true
            }
        });

        console.log("Ticket created successfully in database");

        // Send notifications
        try {
            if (newTicket.state === "OPEN") {
                console.log("Sending NEW TICKET notification...");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sendNewTicketNotification(newTicket as any);
            }

            if (newTicket.assigned_to && newTicket.team_member) {
                console.log(`Sending ASSIGNMENT notification to ${newTicket.team_member.name}...`);
                sendTicketAssignmentNotification(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    newTicket as any,
                    newTicket.team_member.name,
                    newTicket.team_member.email
                );
            }
        } catch (notifErr) {
            console.error("Failed to send notifications, but ticket was created:", notifErr);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { team_member, ...responseTicket } = newTicket;
        console.log("--- POST /api/v1/tickets/ finished successfully ---");
        return NextResponse.json(responseTicket, { status: 201 });

    } catch (error) {
        console.error("CRITICAL ERROR in POST /api/v1/tickets/:", error);
        return NextResponse.json({
            error: "Failed to create ticket",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 400 });
    }
}
