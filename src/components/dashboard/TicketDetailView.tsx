"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Tag, AlertCircle } from "lucide-react";

interface TicketDetailViewProps {
  ticket: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailView({ ticket, open, onOpenChange }: TicketDetailViewProps) {
  if (!ticket) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "medium": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      default: return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
          <SheetTitle className="text-2xl font-bold">{ticket.title}</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed">
            {ticket.description || "No description provided."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <Separator />
          
          <div className="grid gap-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Requester</p>
                <p className="text-xs text-muted-foreground">{ticket.creator?.name || ticket.creator?.email || "Unknown"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Category</p>
                <p className="text-xs text-muted-foreground">{ticket.category || "General"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-xs text-muted-foreground">{ticket.status}</p>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Activity Timeline</h4>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-background border-2 border-primary ring-4 ring-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-sm font-medium">Ticket Created</p>
                <p className="text-xs text-muted-foreground">Initial request received</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
