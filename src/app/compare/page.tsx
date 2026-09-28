import { getPlayerProfile, getPlayerTotals, getPlayerWL, getPlayerPeers } from '@/lib/opendota';
import { Sidebar } from '@/components/Sidebar';
import { CompareSelector } from '@/components/CompareSelector';
import { Target, Users, Swords, Activity, Crosshair, Star } from 'lucide-react';

const FRIENDS_IDS = ['41092826', '112970123', '1138540883', '90178975', '11194455'];

export default async function ComparePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const p1Id = typeof searchParams.p1 === 'string' ? searchParams.p1 : undefined;
  const p2Id = typeof searchParams.p2 === 'string' ? searchParams.p2 : undefined;
  
  const friendsProfiles = await Promise.all(FRIENDS_IDS.map(id => getPlayerProfile(id)));

  let p1Profile, p2Profile, p1Totals, p2Totals, p1Wl, p2Wl, p1Peers;
  let synergy = null;

  if (p1Id && p2Id) {
    [p1Profile, p2Profile, p1Totals, p2Totals, p1Wl, p2Wl, p1Peers] = await Promise.all([
      getPlayerProfile(p1Id),
      getPlayerProfile(p2Id),
      getPlayerTotals(p1Id),
      getPlayerTotals(p2Id),
      getPlayerWL(p1Id),
      getPlayerWL(p2Id),
      getPlayerPeers(p1Id)
    ]);

    synergy = p1Peers.find((p: any) => p.account_id.toString() === p2Id);
  }

  const getStat = (totals: any[], field: string) => totals?.find(t => t.field === field)?.sum || 0;
  const getMatches = (totals: any[], field: string) => totals?.find(t => t.field === field)?.n || 1;

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-300 font-sans selection:bg-red-500/30">
      <Sidebar friends={friendsProfiles} selectedId={p1Id || undefined} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <CompareSelector friends={friendsProfiles} />

          {p1Id && p2Id && p1Profile && p2Profile ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Synergy Header */}
              <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
                <h2 className="text-3xl font-black text-white mb-2 flex items-center justify-center gap-3">
                  <Users className="text-purple-400" size={32} />
                  Sinergia da Dupla
                </h2>
                
                {synergy ? (
                  <div className="mt-8 flex items-center justify-center gap-8">
                    <div className="text-right">
                      <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">Juntos</p>
                      <p className="text-4xl font-black text-white">{synergy.with_games} <span className="text-lg text-slate-500 font-normal">Partidas</span></p>
                    </div>
                    <div className="h-16 w-px bg-slate-700"></div>
                    <div className="text-left">
                      <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">Win Rate Juntos</p>
                      <p className="text-4xl font-black text-green-400">
                        {Math.round((synergy.with_win / synergy.with_games) * 100)}% 
                        <span className="text-lg text-slate-500 font-normal ml-2">({synergy.with_win}V - {synergy.with_games - synergy.with_win}D)</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-slate-400 text-lg">Eles nunca jogaram juntos (ou não há dados públicos suficientes).</p>
                )}
              </div>

              {/* Head to Head Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Player 1 Col */}
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                  <img src={p1Profile.profile.avatarmedium} alt="Avatar P1" className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                  <h3 className="text-2xl font-bold text-white mb-6">{p1Profile.profile.personaname}</h3>

                  <div className="w-full space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Target size={16}/> Total de Partidas</span>
                      <span className="text-xl font-bold text-white">{p1Wl?.win + p1Wl?.lose || 0}</span>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><TrophyIcon /> Win Rate Geral</span>
                      <span className="text-xl font-bold text-green-400">
                        {p1Wl && (p1Wl.win + p1Wl.lose) > 0 ? Math.round((p1Wl.win / (p1Wl.win + p1Wl.lose)) * 100) : 0}%
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Crosshair size={16}/> KDA Médio</span>
                      <span className="text-xl font-bold text-white">
                        {((getStat(p1Totals, 'kills') + getStat(p1Totals, 'assists')) / (getStat(p1Totals, 'deaths') || 1)).toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Star size={16}/> GPM Médio</span>
                      <span className="text-xl font-bold text-yellow-500">
                        {Math.round(getStat(p1Totals, 'gold_per_min') / getMatches(p1Totals, 'gold_per_min'))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player 2 Col */}
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col items-center">
                  <img src={p2Profile.profile.avatarmedium} alt="Avatar P2" className="w-24 h-24 rounded-full border-4 border-red-500 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
                  <h3 className="text-2xl font-bold text-white mb-6">{p2Profile.profile.personaname}</h3>

                  <div className="w-full space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Target size={16}/> Total de Partidas</span>
                      <span className="text-xl font-bold text-white">{p2Wl?.win + p2Wl?.lose || 0}</span>
                    </div>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><TrophyIcon /> Win Rate Geral</span>
                      <span className="text-xl font-bold text-green-400">
                        {p2Wl && (p2Wl.win + p2Wl.lose) > 0 ? Math.round((p2Wl.win / (p2Wl.win + p2Wl.lose)) * 100) : 0}%
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Crosshair size={16}/> KDA Médio</span>
                      <span className="text-xl font-bold text-white">
                        {((getStat(p2Totals, 'kills') + getStat(p2Totals, 'assists')) / (getStat(p2Totals, 'deaths') || 1)).toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2"><Star size={16}/> GPM Médio</span>
                      <span className="text-xl font-bold text-yellow-500">
                        {Math.round(getStat(p2Totals, 'gold_per_min') / getMatches(p2Totals, 'gold_per_min'))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-slate-500 mt-20">
               <Swords size={64} className="mb-4 opacity-20" />
               <p className="text-xl">Selecione dois jogadores para ver a Sinergia!</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  )
}
