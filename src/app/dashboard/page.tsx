import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, BarChart3, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Tickets",
    value: "1,234",
    description: "+12% from last month",
    icon: FileText,
  },
  {
    title: "Active Users",
    value: "567",
    description: "+3% from last week",
    icon: Users,
  },
  {
    title: "Avg. Response Time",
    value: "4h 12m",
    description: "-15% from yesterday",
    icon: Clock,
  },
  {
    title: "Resolution Rate",
    value: "92.4%",
    description: "+2.1% from last month",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Ticket volume over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border rounded-md m-4 border-dashed">
            <div className="text-muted-foreground">Chart placeholder</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Support Request #{1000 + i}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Problem with account authentication...
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
