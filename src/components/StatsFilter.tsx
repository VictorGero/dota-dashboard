'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';

export function StatsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const accountId = searchParams.get('id');
  const dateFilter = searchParams.get('date') || 'all';
  const lobbyFilter = searchParams.get('lobby_type') || 'all';

  const updateFilters = (key: string, value: string) => {
    if (!accountId) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/stats?${params.toString()}`);
  };

  if (!accountId) return null;

  return (
    <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
      <div className="flex items-center gap-2 text-slate-300 font-bold mr-2">
        <Filter size={18} className="text-orange-400" />
      </div>
      
      <select 
        value={dateFilter} 
        onChange={(e) => updateFilters('date', e.target.value)}
        className="bg-slate-800 text-sm text-slate-200 p-2 rounded-lg border border-slate-600 focus:outline-none focus:border-orange-400"
      >
        <option value="all">Todo o Tempo</option>
        <option value="30">Últimos 30 Dias</option>
        <option value="90">Últimos 3 Meses</option>
        <option value="180">Últimos 6 Meses</option>
      </select>

      <select 
        value={lobbyFilter} 
        onChange={(e) => updateFilters('lobby_type', e.target.value)}
        className="bg-slate-800 text-sm text-slate-200 p-2 rounded-lg border border-slate-600 focus:outline-none focus:border-orange-400"
      >
        <option value="all">Qualquer Modo</option>
        <option value="7">Somente Rankeadas</option>
        <option value="0">Somente Normal</option>
      </select>
    </div>
  );
}
