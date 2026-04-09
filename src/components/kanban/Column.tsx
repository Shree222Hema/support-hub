"use client";

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard, { Task } from './TaskCard';

interface ColumnProps {
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ title, status, tasks, onTaskClick }) => {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'To Do': return 'bg-purple-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Completed': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex flex-col w-[350px] bg-white/30 backdrop-blur-xl rounded-[32px] border border-white/20 shadow-2xl overflow-hidden snap-center">
      <div className="p-6 flex items-center justify-between sticky top-0 bg-white/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(status)} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h3>
        </div>
        <div className="h-6 w-9 rounded-full bg-white/50 border border-white/20 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
          {tasks.length}
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-4 transition-colors duration-300 min-h-[500px] ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  index={index} 
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
