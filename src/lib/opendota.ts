export async function getPlayerProfile(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerWL(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/wl`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getRecentMatches(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/recentMatches`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerMatches(accountId: string, limit: number = 100) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/matches?limit=${limit}`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getMatchesTogether(p1Id: string, p2Id: string, limit: number = 5) {
  const res = await fetch(`https://api.opendota.com/api/players/${p1Id}/matches?included_account_id=${p2Id}&limit=${limit}`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getMatchDetails(matchId: string | number) {
  const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`, { next: { revalidate: 86400 } }); // Matches don't change once finished
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerRatings(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/ratings`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getHeroes() {
  const res = await fetch(`https://api.opendota.com/api/heroes`, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getItemsConstants() {
  const res = await fetch(`https://api.opendota.com/api/constants/items`, { next: { revalidate: 86400 } });
  if (!res.ok) return {};
  return res.json();
}

export async function getPlayerHeroes(accountId: string, queryParams: string = '') {
  const url = `https://api.opendota.com/api/players/${accountId}/heroes${queryParams ? `?${queryParams}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getPlayerPeers(accountId: string, queryParams: string = '') {
  const url = `https://api.opendota.com/api/players/${accountId}/peers${queryParams ? `?${queryParams}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getPlayerTotals(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/totals`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  return res.json();
}
