import Link from 'next/link';
import { Users, Gamepad2, LayoutDashboard, BarChart3 } from 'lucide-react';

export function Sidebar({ friends, selectedId }: { friends: any[], selectedId?: string }) {
  return (
    <aside className="w-80 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 tracking-wider flex items-center gap-3">
          <Gamepad2 size={28} className="text-red-500" />
          DOTA DASH
        </h1>
      </div>

      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Menu Principal
        </h2>
        <div className="space-y-2">
          <Link href={selectedId ? `/?id=${selectedId}` : '/'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-200">
            <LayoutDashboard size={18} className="text-red-400" />
            <span className="font-semibold">Visão Geral</span>
          </Link>
          <Link href={selectedId ? `/stats?id=${selectedId}` : '/stats'} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-200">
            <BarChart3 size={18} className="text-orange-400" />
            <span className="font-semibold">Heróis e Amigos</span>
          </Link>
          <Link href="/compare" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-200">
            <Users size={18} className="text-purple-400" />
            <span className="font-semibold">Comparar Sinergia</span>
          </Link>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Users size={14} /> Atalho de Amigos
        </h2>
        <div className="space-y-2">
          {friends.map((f, i) => {
            if (!f?.profile) return null;
            const isSelected = selectedId === f.profile.account_id.toString();
            return (
              <Link key={i} href={`/?id=${f.profile.account_id}`} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isSelected ? 'bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                <img src={f.profile.avatarmedium} alt={f.profile.personaname} className="w-10 h-10 rounded-full border border-slate-600" />
                <div className="overflow-hidden">
                  <p className={`font-semibold truncate ${isSelected ? 'text-red-400' : 'text-slate-200'}`}>{f.profile.personaname}</p>
                  <p className="text-xs text-slate-500">ID: {f.profile.account_id}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
