'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MmrChart({ data }: { data: any[] }) {
  // Format data for chart
  const chartData = data.map(d => ({
    time: new Date(d.time * 1000).toLocaleDateString(),
    mmr: d.solo_competitive_rank || d.competitive_rank || 0
  })).filter(d => d.mmr > 0).slice(-20); // Last 20 rating updates

  if (chartData.length === 0) {
    return <div className="text-slate-500 flex items-center justify-center h-full">Dados de MMR insuficientes ou privados para gerar o gráfico.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis dataKey="time" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
        <YAxis stroke="#475569" fontSize={11} domain={['auto', 'auto']} tickMargin={10} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
        />
        <Line 
          type="monotone" 
          dataKey="mmr" 
          stroke="#ef4444" 
          strokeWidth={4} 
          dot={{ fill: '#0f172a', stroke: '#ef4444', strokeWidth: 2, r: 4 }} 
          activeDot={{ r: 7, fill: '#ef4444', stroke: '#0f172a', strokeWidth: 2 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
