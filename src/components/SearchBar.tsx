'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/?id=${value.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-red-400 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por Account ID (ex: 90242375)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-slate-900/50 text-white rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-red-500/50 transition-all border border-slate-700/50 shadow-inner backdrop-blur-sm"
        />
      </div>
    </form>
  );
}
