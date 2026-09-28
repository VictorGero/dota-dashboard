import { getPlayerProfile, getPlayerHeroes, getPlayerPeers, getHeroes } from '@/lib/opendota';
import { SearchBar } from '@/components/SearchBar';
import { Sidebar } from '@/components/Sidebar';
import { StatsFilter } from '@/components/StatsFilter';
import { Target, Users, Swords } from 'lucide-react';

const FRIENDS_IDS = ['41092826', '112970123', '1138540883', '90178975', '11194455'];

function getHeroImage(heroId: number, heroesList: any[]) {
  const hero = heroesList.find(h => h.id === Number(heroId));
  if (!hero) return '';
  const shortName = hero.name.replace('npc_dota_hero_', '');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
}

function getHeroName(heroId: number, heroesList: any[]) {
  const hero = heroesList.find(h => h.id === Number(heroId));
  return hero ? hero.localized_name : 'Unknown';
}

export default async function StatsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const accountId = typeof searchParams.id === 'string' ? searchParams.id : undefined;
  
  // Build query string for OpenDota API
  const apiParams = new URLSearchParams();
  if (searchParams.date && typeof searchParams.date === 'string') apiParams.set('date', searchParams.date);
  if (searchParams.lobby_type && typeof searchParams.lobby_type === 'string') apiParams.set('lobby_type', searchParams.lobby_type);
  const queryString = apiParams.toString();

  const friendsProfiles = await Promise.all(FRIENDS_IDS.map(id => getPlayerProfile(id)));
  
  let profile = null;
  let playerHeroes = [];
  let playerPeers = [];
  let heroesConstants = [];
  
  if (accountId) {
    [profile, playerHeroes, playerPeers, heroesConstants] = await Promise.all([
      getPlayerProfile(accountId),
      getPlayerHeroes(accountId, queryString),
      getPlayerPeers(accountId, queryString),
      getHeroes()
    ]);
  }

  // Filter top heroes (load up to 50 instead of 10)
  const topHeroes = playerHeroes.slice(0, 50);
  
  // Filter peers with > 5 games (load up to 50)
  const activePeers = playerPeers.filter((p: any) => p.games >= 5).slice(0, 50); 

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-red-500/30">
      <Sidebar friends={friendsProfiles} selectedId={accountId} />
      
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="sticky top-0 z-10 bg-[#0b0e14]/80 backdrop-blur-xl border-b border-slate-800/50 p-6 flex justify-between items-center">
          <SearchBar defaultValue={accountId || ''} />
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><Target size={16} className="text-orange-400"/> Stats Mode</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8 z-10 relative">
          {accountId && profile?.profile ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-4">
                   <img src={profile.profile.avatarmedium} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-slate-700" />
                   <div>
                     <h2 className="text-3xl font-bold">{profile.profile.personaname} <span className="text-slate-500 font-normal">/ Heróis e Amigos</span></h2>
                   </div>
                 </div>
                 
                 <StatsFilter />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Top Heroes Section */}
                 <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 flex flex-col h-[600px]">
                   <div className="p-6 border-b border-slate-800/80 bg-slate-900/80 shrink-0 rounded-t-3xl">
                     <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                       <Swords size={20} className="text-orange-400" /> Heróis Mais Jogados
                     </h3>
                   </div>
                   <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                          <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="p-4 font-semibold">Herói</th>
                            <th className="p-4 font-semibold text-center">Partidas</th>
                            <th className="p-4 font-semibold text-center">Win Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {topHeroes.map((h: any) => {
                            const heroImg = getHeroImage(h.hero_id, heroesConstants);
                            const winRate = Math.round((h.win / h.games) * 100) || 0;
                            return (
                              <tr key={h.hero_id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img src={heroImg} className="w-12 h-auto rounded shadow-sm group-hover:scale-105 transition-transform" />
                                    <span className="font-semibold">{getHeroName(h.hero_id, heroesConstants)}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-center font-mono text-slate-300">{h.games}</td>
                                <td className="p-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate}%</span>
                                    <span className="text-xs text-slate-500">{h.win}V - {h.games - h.win}D</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                     </table>
                   </div>
                 </div>

                 {/* Top Peers Section */}
                 <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 flex flex-col h-[600px]">
                   <div className="p-6 border-b border-slate-800/80 bg-slate-900/80 shrink-0 rounded-t-3xl">
                     <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                       <Users size={20} className="text-blue-400" /> Amigos Frequentes (&gt;5 partidas)
                     </h3>
                   </div>
                   <div className="overflow-y-auto flex-1 custom-scrollbar">
                     <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                          <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="p-4 font-semibold">Jogador</th>
                            <th className="p-4 font-semibold text-center">Partidas Juntos</th>
                            <th className="p-4 font-semibold text-center">Win Rate (Juntos)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {activePeers.length > 0 ? activePeers.map((p: any) => {
                            const winRate = Math.round((p.with_win / p.games) * 100) || 0;
                            return (
                              <tr key={p.account_id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img src={p.avatar} className="w-10 h-10 rounded-full border border-slate-600" />
                                    <div>
                                      <p className="font-semibold text-slate-200">{p.personaname || 'Unknown'}</p>
                                      <p className="text-xs text-slate-500">{p.account_id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-center font-mono text-slate-300">{p.games}</td>
                                <td className="p-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <span className={`font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate}%</span>
                                    <span className="text-xs text-slate-500">{p.with_win}V - {p.games - p.with_win}D</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          }) : (
                            <tr><td colSpan={3} className="p-8 text-center text-slate-500">Nenhum amigo com mais de 5 partidas recentes.</td></tr>
                          )}
                        </tbody>
                     </table>
                   </div>
                 </div>
               </div>

            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
              <h2 className="text-3xl font-bold text-white mb-2">Estatísticas</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Selecione um jogador na barra lateral para ver suas estatísticas detalhadas.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
