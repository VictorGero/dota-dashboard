import { getPlayerProfile, getPlayerWL, getRecentMatches, getPlayerRatings, getHeroes, getItemsConstants } from '@/lib/opendota';
import { SearchBar } from '@/components/SearchBar';
import { MatchList } from '@/components/MatchList';
import { MmrChart } from '@/components/MmrChart';
import { Sidebar } from '@/components/Sidebar';
import { FilterToggle } from '@/components/FilterToggle';
import { Trophy, Swords, Crosshair, TrendingUp, Target, Search, Activity } from 'lucide-react';

const FRIENDS_IDS = ['41092826', '112970123', '1138540883', '90178975']; // Updated with requested friends

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const accountId = typeof searchParams.id === 'string' ? searchParams.id : undefined;
  const isRanked = searchParams.ranked === 'true';
  
  // Fetch friends profiles for sidebar
  const friendsProfiles = await Promise.all(FRIENDS_IDS.map(id => getPlayerProfile(id)));
  
  let profile = null;
  let wl = null;
  let matches = null;
  let ratings = null;
  let heroes = [];
  let itemsData = {};
  let detailedMatches = [];
  
  if (accountId) {
    [profile, wl, matches, ratings, heroes, itemsData] = await Promise.all([
      getPlayerProfile(accountId),
      getPlayerWL(accountId),
      getRecentMatches(accountId),
      getPlayerRatings(accountId),
      getHeroes(),
      getItemsConstants()
    ]);

    if (matches && matches.length > 0) {
      if (isRanked) {
         matches = matches.filter((m: any) => m.lobby_type === 7);
      }
      
      // Fetch details only for the top 5 matches to keep it fast
      const { getMatchDetails } = await import('@/lib/opendota');
      const top5 = matches.slice(0, 5);
      const details = await Promise.all(top5.map((m: any) => getMatchDetails(m.match_id)));
      
      detailedMatches = top5.map((m: any, idx: number) => {
         const fullMatch = details[idx];
         if (!fullMatch) return m;
         // Find player in full match
         const p = fullMatch.players?.find((p: any) => p.account_id?.toString() === accountId);
         if (p) {
           return { ...m, ...p }; // Merge full details (like items, mvp/fantasy) into match
         }
         return m;
      });
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-red-500/30">
      <Sidebar friends={friendsProfiles} selectedId={accountId} />
      
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-[#0b0e14]/80 backdrop-blur-xl border-b border-slate-800/50 p-6 flex justify-between items-center">
          <SearchBar defaultValue={accountId || ''} />
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2"><Target size={16} className="text-red-400"/> Status: Online</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8 z-10 relative">
          {accountId && profile?.profile ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               
               {/* Hero Profile Banner */}
               <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 shadow-2xl">
                 <div className="absolute inset-0 bg-[url('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/backgrounds/greyfade.jpg')] opacity-20 bg-cover bg-center mix-blend-overlay" />
                 
                 <div className="relative p-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="relative group">
                     <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                     <img src={profile.profile.avatarfull} alt="Avatar" className="w-36 h-36 rounded-full border-4 border-slate-800 shadow-2xl relative z-10 object-cover" />
                     
                     {/* Rank Medal */}
                     {profile.rank_tier && (
                       <div className="absolute -bottom-6 -right-6 z-20 flex flex-col items-center justify-center filter drop-shadow-xl scale-90 group-hover:scale-100 transition-transform">
                         <div className="relative w-20 h-20 flex items-center justify-center">
                           <img src={`https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${profile.rank_tier >= 80 ? 8 : Math.floor(profile.rank_tier / 10)}.png`} className="absolute w-full h-full object-contain" alt="Medal" />
                           {profile.rank_tier < 80 && (profile.rank_tier % 10) > 0 && (
                             <img src={`https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_${profile.rank_tier % 10}.png`} className="absolute w-full h-full object-contain" alt="Star" />
                           )}
                           {profile.rank_tier >= 80 && profile.leaderboard_rank && (
                             <span className="absolute bottom-2 text-[10px] font-black text-white bg-black/60 px-1 rounded">{profile.leaderboard_rank}</span>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                   
                   <div className="text-center md:text-left flex-1">
                     <h2 className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">{profile.profile.personaname}</h2>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                        
                        <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                          <Trophy size={20} className="text-yellow-400" />
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rank Atual</p>
                            <p className="text-xl font-bold text-white">
                              {(() => {
                                const tier = profile.rank_tier;
                                if (!tier) return 'Sem Rank';
                                if (tier >= 80) return profile.leaderboard_rank ? `Imortal #${profile.leaderboard_rank}` : 'Imortal';
                                const medals = ['', 'Arauto', 'Guardião', 'Cruzado', 'Arconte', 'Lenda', 'Ancestral', 'Divino'];
                                return `${medals[Math.floor(tier / 10)]} ${tier % 10}`;
                              })()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                          <TrendingUp size={20} className="text-orange-400" />
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">MMR Estimado</p>
                            <p className="text-xl font-bold text-white">{profile.mmr_estimate?.estimate || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {wl && (
                          <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                            <Swords size={20} className="text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Win Rate</p>
                              <div className="flex gap-2 items-baseline">
                                <span className="text-xl font-bold text-white">{Math.round((wl.win / (wl.win + wl.lose)) * 100) || 0}%</span>
                                <span className="text-sm text-slate-400">({wl.win}V - {wl.lose}D)</span>
                              </div>
                            </div>
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Chart Section */}
                 <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-700/50 flex flex-col">
                   <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                     <Activity size={20} className="text-red-400" /> Evolução de MMR (Ratings)
                   </h3>
                   <div className="flex-1 min-h-[300px]">
                     <MmrChart data={ratings || []} />
                   </div>
                 </div>
                 
                 {/* Stats/Summary Section (Placeholder for now) */}
                 <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-6 text-slate-100 flex items-center gap-2">
                     <Crosshair size={20} className="text-red-400" /> Visão Geral
                   </h3>
                   <div className="space-y-4">
                     <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <p className="text-sm text-slate-400">ID da Conta</p>
                        <p className="font-mono text-lg text-slate-200 mt-1">{profile.profile.account_id}</p>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <p className="text-sm text-slate-400">Último Login</p>
                        <p className="text-lg text-slate-200 mt-1">
                          {profile.profile.last_login ? new Date(profile.profile.last_login).toLocaleDateString() : 'Desconhecido'}
                        </p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Matches Section */}
               {matches && matches.length > 0 && (
                 <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 overflow-hidden">
                   <div className="p-6 border-b border-slate-800/80 bg-slate-900/80 flex justify-between items-center">
                     <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                       <Swords size={20} className="text-red-400" /> Últimas Partidas
                     </h3>
                     <FilterToggle />
                   </div>
                   <div className="p-2">
                     <MatchList matches={[...detailedMatches, ...matches.slice(5)]} heroes={heroes} itemsData={itemsData} />
                   </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-700">
                <Search size={40} className="text-slate-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Dota Dash</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  {accountId 
                    ? "O ID procurado não foi encontrado ou não é público. Tente outro ID."
                    : "Selecione um amigo na barra lateral ou busque por um Account ID para ver estatísticas detalhadas."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
