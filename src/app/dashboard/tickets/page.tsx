"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Ticket, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  User,
  Tag,
  ArrowRight
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "Medium", category: "Technical" });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(newTicket)
      });
      if (response.ok) {
        setIsCreateOpen(false);
        setNewTicket({ title: "", description: "", priority: "Medium", category: "Technical" });
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    console.log("Attempting to close ticket:", ticketId);
    try {
      const response = await fetch("/api/tickets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ id: ticketId, status: "Closed" })
      });
      
      const data = await response.json();
      console.log("Close ticket response:", data);

      if (response.ok) {
        fetchTickets();
      } else {
        alert(`Failed to close ticket: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to close ticket:", error);
      alert("A network error occurred while trying to close the ticket.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Urgent": return "destructive";
      case "Medium": return "warning";
      case "Low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Closed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "Open": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">Manage and track customer support requests efficiently.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Ticket</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Ticket summary..." 
                  className="bg-accent/50 border-none h-12 focus-visible:ring-primary"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. Technical, Billing, General" 
                  className="bg-accent/50 border-none h-12 focus-visible:ring-primary"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of the issue..." 
                  className="bg-accent/50 border-none min-h-[120px] focus-visible:ring-primary"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTicket} className="w-full h-12 text-lg font-bold">Create Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-12 h-12 bg-card border-none shadow-sm focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 gap-2 bg-card border-none shadow-sm">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[200px] rounded-2xl bg-accent/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card rounded-2xl">
              <CardHeader className="pb-4 border-b border-accent/50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getPriorityColor(ticket.priority) as any} className="uppercase tracking-widest text-[10px] py-0.5 px-2 rounded-full">
                    {ticket.priority}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-none shadow-2xl">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <ArrowRight className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        variant="destructive"
                        className="gap-2 cursor-pointer"
                        onSelect={() => handleCloseTicket(ticket.id)}
                      >
                         Close Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                  {ticket.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                  {ticket.description || "No description provided."}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-accent/40 py-1.5 px-3 rounded-full">
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-accent/40 py-1.5 px-3 rounded-full">
                    <Tag className="h-3 w-3" />
                    {ticket.category || "General"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-accent/30 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-[10px] flex flex-col">
                      <span className="font-bold text-foreground truncate max-w-[80px]">{(ticket.creator as any)?.name || (ticket.creator as any)?.email}</span>
                      <span className="text-muted-foreground">Creator</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredTickets.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-accent/30 flex items-center justify-center">
                <Ticket className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="max-w-[280px]">
                <h3 className="text-xl font-bold">No tickets found</h3>
                <p className="text-muted-foreground mt-2">Create your first ticket to start tracking support requests.</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="mt-4">
                Create First Ticket
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
