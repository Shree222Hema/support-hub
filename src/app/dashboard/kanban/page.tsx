"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from '@/components/kanban/Column';
import { Task } from '@/components/kanban/TaskCard';
import { useSocket } from '@/context/SocketContext';
import { CreateTaskDialog } from '@/components/kanban/CreateTaskDialog';
import { TaskDetailView } from '@/components/kanban/TaskDetailView';
import { Plus, Layout, Zap } from 'lucide-react';

const KANBAN_STATUSES = ['To Do', 'In Progress', 'Completed'] as const;

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    const initKanban = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch/Auto-seed Board
            const boardRes = await fetch('/api/kanban/boards', { headers });
            if (boardRes.ok) {
              const boardsData = await boardRes.json();
              setBoards(boardsData);
              if (boardsData.length > 0) {
                setActiveBoard(boardsData[0]);
                
                // 2. Fetch Tasks for the active board
                const tasksRes = await fetch(`/api/kanban/tasks?boardId=${boardsData[0].id}`, { headers });
                if (tasksRes.ok) {
                  setTasks(await tasksRes.json());
                }
              }
            }
        } catch (error) {
            console.error('Failed to initialize Kanban:', error);
        } finally {
            setLoading(false);
        }
    };
    initKanban();

    if (socket && activeBoard) {
      socket.emit('join-board', activeBoard.id);
      socket.on('task-updated', (updatedData: any) => {
        if (updatedData.type === 'MOVE') {
          setTasks((prev) => {
            const newTasks = prev.map(t => 
              t.id === updatedData.taskId ? { ...t, status: updatedData.newStatus } : t
            );
            return newTasks;
          });
        }
      });
    }

    return () => {
      if (socket) socket.off('task-updated');
    };
  }, [socket, activeBoard?.id]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Task['status'];
    const updatedTasks = tasks.map(t => 
        t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const token = localStorage.getItem("token");
      await fetch('/api/kanban/tasks', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id: draggableId, status: newStatus }),
      });

      if (socket && activeBoard) {
        socket.emit('task-update', {
          type: 'MOVE',
          taskId: draggableId,
          boardId: activeBoard.id,
          newStatus,
        });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getTasksByStatus = (status: (typeof KANBAN_STATUSES)[number]) => {
    return tasks.filter((t) => t.status === status);
  };

  if (loading) return <div className="h-full flex items-center justify-center font-bold text-slate-400">Syncing Workspace...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layout className="h-4 w-4 text-primary" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">
               {activeBoard?.name || "Main Board"}
             </h2>
          </div>
          <p className="text-sm font-medium text-slate-500">Master workflow orchestration for support operations.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 shadow-xl">
              <Zap className={`h-4 w-4 ${isConnected ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {isConnected ? 'Sync Active' : 'Offline'}
              </span>
           </div>
           <button 
             onClick={() => setCreateDialogOpen(true)}
             className="group relative flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl transition-all hover:scale-105 hover:bg-black active:scale-95 overflow-hidden"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
             <Plus className="h-4 w-4" />
             <span className="text-sm">New Task</span>
           </button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-8 h-full min-w-max pb-8 snap-x">
            {KANBAN_STATUSES.map((status) => (
              <Column 
                  key={status} 
                  title={status} 
                  status={status} 
                  tasks={getTasksByStatus(status)} 
                  onTaskClick={(task) => setSelectedTask(task)}
              />
            ))}
          </div>
        </DragDropContext>
      </main>

      <CreateTaskDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        boardId={activeBoard?.id}
        onTaskCreated={(task) => setTasks(prev => [task, ...prev])}
      />

      <TaskDetailView 
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </motion.div>
  );
}
