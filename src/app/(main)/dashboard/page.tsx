import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Ticket, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";

async function getDashboardData() {
  try {
    const res = await fetch("/api/v1/reports/summary", {
      cache: "no-store", // Always fetch fresh data natively Server Side
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

async function getRecentTickets() {
  try {
    const res = await fetch("/api/v1/tickets/?limit=4", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [data, recentTickets] = await Promise.all([
    getDashboardData(),
    getRecentTickets()
  ]);

  if (!data) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50/50 rounded-xl my-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Backend Connection Error</h1>
        <p>Could not connect to the FastAPI backend at <strong>http://127.0.0.1:8000</strong>.</p>
        <p className="mt-2 text-sm">Please ensure uvicorn is running and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Hub Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time metrics from your live customer support queues.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Tickets Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{data.total_tickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all statuses</p>
          </CardContent>
        </Card>

        {/* Open Tickets Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-yellow-700">{data.open_tickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        {/* Closed Tickets Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-green-700">{data.closed_tickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Issues successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>
              Ticket volume across urgency levels
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border rounded-md m-4 border-dashed">
            <div className="text-center space-y-4">
              {Object.entries(data.priority_breakdown).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center w-64 p-3 bg-secondary rounded-lg">
                  <span className="font-semibold">{priority}</span>
                  <span className="text-xl font-bold bg-background px-3 py-1 rounded-md">{String(count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 hover:shadow-md transition-shadow bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Live Monitoring Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent tickets found.
                </p>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between border-b border-blue-100 last:border-0 pb-3 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ticket.status === "OPEN"
                      ? "bg-yellow-100/80 text-yellow-800"
                      : "bg-green-100/80 text-green-800"
                      }`}>
                      {ticket.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
