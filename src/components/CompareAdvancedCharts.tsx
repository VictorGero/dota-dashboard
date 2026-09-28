'use client';

import { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';

export function CompareAdvancedCharts({ p1Profile, p2Profile, p1Totals, p2Totals, p1Matches, p2Matches, p1Heroes, p2Heroes, heroesConst }: any) {
  
  // 1. Radar Chart (Lifetime)
  const radarData = useMemo(() => {
    const getS = (t: any[], f: string) => t?.find((x: any) => x.field === f)?.sum || 0;
    const getN = (t: any[], f: string) => t?.find((x: any) => x.field === f)?.n || 1;
    
    // We normalize the values conceptually. A simple approach is just plotting raw averages 
    // and letting Recharts auto-scale, but since scales differ wildly (GPM vs KDA), 
    // we should create a relative score or use multiple axes.
    // For simplicity, we calculate "Score" based on a max theoretical value to make the radar look good.
    const calcScore = (sum: number, n: number, max: number) => Math.min(100, Math.round(((sum / n) / max) * 100));

    return [
      {
        subject: 'Farm (GPM)',
        P1: calcScore(getS(p1Totals, 'gold_per_min'), getN(p1Totals, 'gold_per_min'), 800),
        P2: calcScore(getS(p2Totals, 'gold_per_min'), getN(p2Totals, 'gold_per_min'), 800),
        fullMark: 100
      },
      {
        subject: 'Luta (Hero Dmg)',
        P1: calcScore(getS(p1Totals, 'hero_damage'), getN(p1Totals, 'hero_damage'), 40000),
        P2: calcScore(getS(p2Totals, 'hero_damage'), getN(p2Totals, 'hero_damage'), 40000),
        fullMark: 100
      },
      {
        subject: 'Objetivo (Tower Dmg)',
        P1: calcScore(getS(p1Totals, 'tower_damage'), getN(p1Totals, 'tower_damage'), 8000),
        P2: calcScore(getS(p2Totals, 'tower_damage'), getN(p2Totals, 'tower_damage'), 8000),
        fullMark: 100
      },
      {
        subject: 'Agressão (Kills)',
        P1: calcScore(getS(p1Totals, 'kills'), getN(p1Totals, 'kills'), 15),
        P2: calcScore(getS(p2Totals, 'kills'), getN(p2Totals, 'kills'), 15),
        fullMark: 100
      },
      {
        subject: 'Suporte (Assists)',
        P1: calcScore(getS(p1Totals, 'assists'), getN(p1Totals, 'assists'), 25),
        P2: calcScore(getS(p2Totals, 'assists'), getN(p2Totals, 'assists'), 25),
        fullMark: 100
      },
    ];
  }, [p1Totals, p2Totals]);

  // 2. Roles Pie Chart (Recent 100 matches)
  const getRoles = (matches: any[]) => {
    const roles = { Safe: 0, Mid: 0, Offlane: 0, Jungle: 0, Suporte: 0 };
    matches.forEach(m => {
      if (m.lane_role === 1) roles.Safe++;
      else if (m.lane_role === 2) roles.Mid++;
      else if (m.lane_role === 3) roles.Offlane++;
      else if (m.lane_role === 4) roles.Jungle++;
      else roles.Suporte++; // simplificando
    });
    return [
      { name: 'Safe Lane', value: roles.Safe, color: '#3b82f6' },
      { name: 'Mid Lane', value: roles.Mid, color: '#ef4444' },
      { name: 'Offlane', value: roles.Offlane, color: '#22c55e' },
      { name: 'Roam/Sup', value: roles.Jungle + roles.Suporte, color: '#a855f7' },
    ].filter(r => r.value > 0);
  };

  const p1Roles = useMemo(() => getRoles(p1Matches), [p1Matches]);
  const p2Roles = useMemo(() => getRoles(p2Matches), [p2Matches]);

  // 3. Hero Intersection
  const commonHeroes = useMemo(() => {
    const p2HeroMap = new Map(p2Heroes.map((h: any) => [h.hero_id, h]));
    const common = [];
    for (const h1 of p1Heroes) {
      if (h1.games >= 5 && p2HeroMap.has(h1.hero_id)) {
        const h2 = p2HeroMap.get(h1.hero_id);
        if (h2.games >= 5) {
          const heroData = heroesConst.find((hc: any) => hc.id === Number(h1.hero_id));
          if (heroData) {
            common.push({
              heroName: heroData.localized_name,
              img: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroData.name.replace('npc_dota_hero_', '')}.png`,
              p1Games: h1.games, p1Winrate: Math.round((h1.win/h1.games)*100),
              p2Games: h2.games, p2Winrate: Math.round((h2.win/h2.games)*100),
            });
          }
        }
      }
    }
    return common.sort((a, b) => (b.p1Games + b.p2Games) - (a.p1Games + a.p2Games)).slice(0, 5);
  }, [p1Heroes, p2Heroes, heroesConst]);

  return (
    <div className="space-y-8 mt-8">
      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 text-center flex flex-col items-center">
          <h3 className="text-xl font-bold text-white mb-4">Estilo de Jogo (Radar)</h3>
          <p className="text-xs text-slate-500 mb-2">Baseado no Lifetime em escala relativa de 0 a 100.</p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Radar name={p1Profile.profile.personaname} dataKey="P1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name={p2Profile.profile.personaname} dataKey="P2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Pie Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col">
           <h3 className="text-xl font-bold text-white mb-4 text-center">Posições (Últimas 100 Partidas)</h3>
           <div className="flex-1 flex flex-col md:flex-row justify-around items-center">
             
             {/* P1 Pie */}
             <div className="flex flex-col items-center w-full md:w-1/2 h-[250px]">
                <h4 className="font-bold text-blue-400">{p1Profile.profile.personaname}</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={p1Roles} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {p1Roles.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             </div>

             {/* P2 Pie */}
             <div className="flex flex-col items-center w-full md:w-1/2 h-[250px]">
                <h4 className="font-bold text-red-400">{p2Profile.profile.personaname}</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={p2Roles} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {p2Roles.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
             </div>

           </div>
        </div>
      </div>

      {/* Common Heroes Intersection */}
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-6">Confronto de Heróis (Em Comum)</h3>
        {commonHeroes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {commonHeroes.map((h: any, i: number) => (
              <div key={i} className="bg-slate-800/80 rounded-xl p-4 flex flex-col items-center border border-slate-700">
                <img src={h.img} alt={h.heroName} className="w-16 h-16 rounded-full mb-3 border-2 border-slate-600" />
                <h4 className="font-bold text-slate-200 text-sm text-center h-10">{h.heroName}</h4>
                
                <div className="w-full mt-2 space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-blue-500/10 p-2 rounded">
                    <span className="text-blue-400 font-bold">{h.p1Winrate}% WR</span>
                    <span className="text-slate-500">{h.p1Games} jogos</span>
                  </div>
                  <div className="flex justify-between items-center bg-red-500/10 p-2 rounded">
                    <span className="text-red-400 font-bold">{h.p2Winrate}% WR</span>
                    <span className="text-slate-500">{h.p2Games} jogos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">Nenhum herói em comum com no mínimo 5 partidas jogadas.</p>
        )}
      </div>
    </div>
  );
}
