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
import { Clock, CheckCircle2, ListTodo, MoreHorizontal } from "lucide-react";

interface TaskDetailViewProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailView({ task, open, onOpenChange }: TaskDetailViewProps) {
  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white/80 backdrop-blur-xl border-l-[1px] border-white/20">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`font-bold ${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
              <Clock className="h-3 w-3" />
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">{task.title}</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500 leading-relaxed">
            {task.description || "Describe the execution steps for this task..."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <Separator className="bg-slate-200/50" />
          
          <div className="grid gap-4">
            <div className="group flex items-center gap-3 text-sm p-3 rounded-2xl transition-all hover:bg-slate-50">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ListTodo className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Project Column</p>
                <p className="text-xs text-slate-400 font-medium">Currently in {task.status}</p>
              </div>
            </div>

            <div className="group flex items-center gap-3 text-sm p-3 rounded-2xl transition-all hover:bg-slate-50">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-slate-700">Completion Status</p>
                <p className="text-xs text-slate-400 font-medium">{task.status === 'Completed' ? 'Resolved and Verified' : 'Awaiting completion'}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200/50" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Execution Log</h4>
              <MoreHorizontal className="h-4 w-4 text-slate-300" />
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-100 before:to-transparent">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-2 border-primary ring-4 ring-slate-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-xs font-bold text-slate-700">Task Initialized</p>
                <p className="text-[10px] font-medium text-slate-400 italic">Automated log entry</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
