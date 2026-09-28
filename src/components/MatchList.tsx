'use client';

function getHeroImage(heroId: number, heroes: any[]) {
  const hero = heroes.find(h => h.id === heroId);
  if (!hero) return '';
  const shortName = hero.name.replace('npc_dota_hero_', '');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
}

function getItemImage(itemId: number, itemsData: any) {
  if (!itemId) return null;
  // itemsData is an object with item names as keys. Each has an 'id' property.
  const item: any = Object.values(itemsData).find((i: any) => i.id === itemId);
  if (item && item.img) {
    // OpenDota img paths are like /apps/dota2/images/...
    return `https://cdn.cloudflare.steamstatic.com${item.img}`;
  }
  return null;
}

export function MatchList({ matches, heroes, itemsData }: { matches: any[], heroes: any[], itemsData: any }) {
  const recent = matches.slice(0, 10);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
            <th className="p-4 font-semibold">Herói</th>
            <th className="p-4 font-semibold">Resultado</th>
            <th className="p-4 font-semibold">KDA</th>
            <th className="p-4 font-semibold">Farm</th>
            <th className="p-4 font-semibold">Itens</th>
            <th className="p-4 font-semibold text-right">Duração</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {recent.map((match: any) => {
            const isRadiant = match.player_slot < 128;
            const isWin = isRadiant === match.radiant_win;
            const heroImageUrl = getHeroImage(match.hero_id, heroes);
            const durationMins = Math.floor(match.duration / 60);
            const durationSecs = match.duration % 60;
            
            // Items are only available if we fetched the full match details (top 5)
            const items = [match.item_0, match.item_1, match.item_2, match.item_3, match.item_4, match.item_5, match.item_neutral];

            return (
              <tr key={match.match_id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    {heroImageUrl ? (
                      <img src={heroImageUrl} alt="Hero" className="w-16 h-10 object-cover rounded shadow-md group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-16 h-10 bg-slate-800 rounded animate-pulse"></div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider ${isWin ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {isWin ? 'Vitória' : 'Derrota'}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-300">
                  <span className="text-white">{match.kills}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-red-400">{match.deaths}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">{match.assists}</span>
                </td>
                <td className="p-4 text-xs">
                   {match.gold_per_min && (
                     <div className="flex flex-col gap-1">
                       <span className="text-yellow-500 font-mono" title="Gold Per Min">GPM: {match.gold_per_min}</span>
                       <span className="text-blue-400 font-mono" title="XP Per Min">XPM: {match.xp_per_min}</span>
                       {match.last_hits !== undefined && <span className="text-slate-400 font-mono">LH: {match.last_hits}</span>}
                     </div>
                   )}
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {items.map((itemId, idx) => {
                      if (itemId === undefined) return null; // Not loaded (not top 5)
                      const img = getItemImage(itemId, itemsData);
                      const isNeutral = idx === 6;
                      return (
                        <div key={idx} className={`w-8 h-6 bg-slate-800 rounded overflow-hidden border border-slate-700/50 ${isNeutral ? 'rounded-full w-6 h-6 ml-1' : ''}`}>
                          {img && <img src={img} className="w-full h-full object-cover" />}
                        </div>
                      );
                    })}
                    {match.item_0 === undefined && (
                      <span className="text-xs text-slate-600 italic">Itens não carregados</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-right font-mono">
                  {durationMins}:{durationSecs.toString().padStart(2, '0')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
