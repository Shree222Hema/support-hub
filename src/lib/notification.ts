// Removed Prisma Ticket import to prevent strict type errors.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendNewTicketNotification(ticket: any) {
    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log("GOOGLE_CHAT_WEBHOOK_URL is not set. Skipping notification.");
        return;
    }

    const message = {
        text: `🎫 *New Ticket Created*\n\n*ID:* ${ticket.id}\n*Title:* ${ticket.title}\n*Priority:* ${ticket.priority}\n*Status:* ${ticket.status}`,
    };

    // Fire and forget
    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
    })
        .then((res) => {
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            console.log(`Google Chat notification sent successfully for Ticket '${ticket.id}'`);
        })
        .catch((err) => {
            console.error(`Failed to send Google Chat webhook for Ticket '${ticket.id}':`, err);
        });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function sendTicketAssignmentNotification(ticket: any, assigneeName: string, assigneeEmail: string) {
    const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    if (!webhookUrl) return;

    const message = {
        text: `👤 *Ticket Assigned*\n\n*ID:* ${ticket.id}\n*Title:* ${ticket.title}\n*Priority:* ${ticket.priority}\n*Assigned To:* ${assigneeName}`,
    };

    fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
    })
        .then((res) => {
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            console.log(`Assignment Google Chat notification sent successfully for Ticket '${ticket.id}'`);
        })
        .catch((err) => {
            console.error(`Failed to send assignment webhook for Ticket '${ticket.id}':`, err);
        });
}
