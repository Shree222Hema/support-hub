"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

const PRIORITY_COLORS: any = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#3b82f6",
};

export function PriorityBarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground italic">
        No priority data available
      </div>
    );
  }

  // Ensure consistent order: High, Medium, Low
  const orderedData = ["High", "Medium", "Low"].map(p => {
    const found = data.find(d => d.name === p);
    return found ? found : { name: p, value: 0 };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={orderedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 12 }}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {orderedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || "#8b5cf6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
