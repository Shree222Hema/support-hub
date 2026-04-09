"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Clock, MoreHorizontal } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  createdAt: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="outline-none mb-4"
        >
          <motion.div
            layoutId={task.id}
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`
              bg-white/60 backdrop-blur-md p-5 rounded-[24px] border border-white/40 shadow-xl cursor-default group
              ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/20 rotate-2' : 'hover:shadow-2xl'}
              transition-shadow
            `}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                #ORD-{task.id.slice(-4).toUpperCase()}
              </span>
              <MoreHorizontal className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {task.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Clock className="h-3 w-3" />
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="h-6 w-6 rounded-full bg-slate-100 border border-white flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-slate-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
