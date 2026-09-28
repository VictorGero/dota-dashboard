'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Swords } from 'lucide-react';
import { useState } from 'react';

export function CompareSelector({ friends }: { friends: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [p1, setP1] = useState(searchParams.get('p1') || '');
  const [p2, setP2] = useState(searchParams.get('p2') || '');

  const handleCompare = () => {
    if (p1 && p2) {
      router.push(`/compare?p1=${p1}&p2=${p2}`);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-xl mb-8">
      <h3 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
        <Users size={20} className="text-purple-400" /> Selecione os Jogadores
      </h3>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <select 
          value={p1} 
          onChange={e => setP1(e.target.value)} 
          className="flex-1 bg-slate-800 text-slate-200 p-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-400"
        >
          <option value="" disabled>Escolha o Jogador 1</option>
          {friends.map((f, i) => f?.profile && (
            <option key={i} value={f.profile.account_id}>{f.profile.personaname} ({f.profile.account_id})</option>
          ))}
        </select>
        
        <div className="bg-slate-800 p-3 rounded-full border border-slate-700">
          <Swords size={20} className="text-slate-400" />
        </div>
        
        <select 
          value={p2} 
          onChange={e => setP2(e.target.value)} 
          className="flex-1 bg-slate-800 text-slate-200 p-3 rounded-xl border border-slate-600 focus:outline-none focus:border-purple-400"
        >
          <option value="" disabled>Escolha o Jogador 2</option>
          {friends.map((f, i) => f?.profile && (
            <option key={i} value={f.profile.account_id}>{f.profile.personaname} ({f.profile.account_id})</option>
          ))}
        </select>
        
        <button 
          onClick={handleCompare}
          disabled={!p1 || !p2 || p1 === p2}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Comparar
        </button>
      </div>
    </div>
  );
}
