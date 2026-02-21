import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Traccel Support Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Built with Next.js 15+ and shadcn/ui components.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
