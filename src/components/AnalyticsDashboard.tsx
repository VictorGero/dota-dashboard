'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Filter, Calendar, Swords, Trophy, Activity } from 'lucide-react';

export function AnalyticsDashboard({ matches, heroes }: { matches: any[], heroes: any[] }) {
  const [filterMode, setFilterMode] = useState<string>('all'); // all, ranked, normal, turbo
  const [filterResult, setFilterResult] = useState<string>('all'); // all, win, loss
  const [filterHero, setFilterHero] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all'); // all, 30d, 7d

  // Derive unique heroes played from the 100 matches
  const playedHeroes = useMemo(() => {
    const heroIds = new Set(matches.map(m => m.hero_id));
    return heroes.filter(h => heroIds.has(h.id)).sort((a, b) => a.localized_name.localeCompare(b.localized_name));
  }, [matches, heroes]);

  // Apply filters
  const filteredMatches = useMemo(() => {
    const now = Date.now() / 1000;
    return matches.filter(m => {
      // Game Mode
      if (filterMode === 'ranked' && m.lobby_type !== 7) return false;
      if (filterMode === 'normal' && m.lobby_type !== 0) return false;
      if (filterMode === 'turbo' && m.game_mode !== 23) return false;
      
      // Result
      const isWin = (m.player_slot < 128) === m.radiant_win;
      if (filterResult === 'win' && !isWin) return false;
      if (filterResult === 'loss' && isWin) return false;

      // Hero
      if (filterHero !== 'all' && m.hero_id.toString() !== filterHero) return false;

      // Time
      if (filterTime === '30d' && (now - m.start_time) > 30 * 24 * 60 * 60) return false;
      if (filterTime === '7d' && (now - m.start_time) > 7 * 24 * 60 * 60) return false;

      return true;
    }).reverse(); // Reverse so chronological order (oldest first for charts)
  }, [matches, filterMode, filterResult, filterHero, filterTime]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    let wins = 0;
    return filteredMatches.map((m, index) => {
      const isWin = (m.player_slot < 128) === m.radiant_win;
      if (isWin) wins++;
      
      const kda = m.deaths === 0 ? (m.kills + m.assists) : ((m.kills + m.assists) / m.deaths);
      
      return {
        name: new Date(m.start_time * 1000).toLocaleDateString(),
        kills: m.kills,
        deaths: m.deaths,
        assists: m.assists,
        kda: parseFloat(kda.toFixed(2)),
        winrate: parseFloat(((wins / (index + 1)) * 100).toFixed(1)),
        isWin
      };
    });
  }, [filteredMatches]);

  const totalGames = filteredMatches.length;
  const totalWins = filteredMatches.filter(m => (m.player_slot < 128) === m.radiant_win).length;
  const overallWinrate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative">
        <div className="flex items-center gap-3 text-slate-300 font-bold">
          <Filter size={20} className="text-blue-400" /> FILTROS
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-600 focus:outline-none focus:border-red-400">
            <option value="all">Todas as Partidas</option>
            <option value="ranked">Somente Rankeadas</option>
            <option value="normal">Normal Game</option>
            <option value="turbo">Turbo</option>
          </select>

          <select value={filterResult} onChange={e => setFilterResult(e.target.value)} className="bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-600 focus:outline-none focus:border-red-400">
            <option value="all">Todos os Resultados</option>
            <option value="win">Somente Vitórias</option>
            <option value="loss">Somente Derrotas</option>
          </select>

          <select value={filterHero} onChange={e => setFilterHero(e.target.value)} className="bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-600 focus:outline-none focus:border-red-400">
            <option value="all">Todos os Heróis</option>
            {playedHeroes.map(h => (
              <option key={h.id} value={h.id}>{h.localized_name}</option>
            ))}
          </select>

          <select value={filterTime} onChange={e => setFilterTime(e.target.value)} className="bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-600 focus:outline-none focus:border-red-400">
            <option value="all">Todo o Histórico (100+)</option>
            <option value="30d">Últimos 30 Dias</option>
            <option value="7d">Últimos 7 Dias</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {totalGames > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400"><Calendar size={24} /></div>
            <div><p className="text-slate-400 text-sm">Partidas Filtradas</p><p className="text-2xl font-bold text-white">{totalGames}</p></div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400"><Trophy size={24} /></div>
            <div><p className="text-slate-400 text-sm">Win Rate</p><p className="text-2xl font-bold text-white">{overallWinrate}%</p></div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400"><Activity size={24} /></div>
            <div>
              <p className="text-slate-400 text-sm">KDA Médio</p>
              <p className="text-2xl font-bold text-white">
                {(chartData.reduce((acc, curr) => acc + curr.kda, 0) / totalGames).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {totalGames > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Winrate Chart */}
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col h-[400px]">
             <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
               <Trophy size={20} className="text-green-400" /> Evolução de Win Rate
             </h3>
             <div className="flex-1 min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} minTickGap={30} />
                    <YAxis stroke="#64748b" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="winrate" stroke="#4ade80" strokeWidth={3} dot={false} name="Win Rate (%)" />
                  </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* KDA Chart */}
          <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col h-[400px]">
             <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
               <Swords size={20} className="text-red-400" /> Evolução de KDA (Kills/Deaths/Assists)
             </h3>
             <div className="flex-1 min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} minTickGap={30} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="kills" stroke="#ef4444" strokeWidth={2} dot={false} name="Kills" />
                    <Line type="monotone" dataKey="deaths" stroke="#64748b" strokeWidth={2} dot={false} name="Deaths" />
                    <Line type="monotone" dataKey="assists" stroke="#3b82f6" strokeWidth={2} dot={false} name="Assists" />
                  </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-md p-12 rounded-3xl border border-slate-700/50 text-center">
          <Filter size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-300">Nenhuma partida encontrada</h3>
          <p className="text-slate-500 mt-2">Tente mudar os filtros acima para ver os gráficos.</p>
        </div>
      )}
    </div>
  );
}
