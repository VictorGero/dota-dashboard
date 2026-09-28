export async function getPlayerProfile(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerWL(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/wl`);
  if (!res.ok) return null;
  return res.json();
}

export async function getRecentMatches(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/recentMatches`);
  if (!res.ok) return null;
  return res.json();
}

export async function getMatchDetails(matchId: string | number) {
  const res = await fetch(`https://api.opendota.com/api/matches/${matchId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPlayerRatings(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/ratings`);
  if (!res.ok) return null;
  return res.json();
}

export async function getHeroes() {
  const res = await fetch(`https://api.opendota.com/api/heroes`);
  if (!res.ok) return [];
  return res.json();
}

export async function getItemsConstants() {
  const res = await fetch(`https://api.opendota.com/api/constants/items`);
  if (!res.ok) return {};
  return res.json();
}

export async function getPlayerHeroes(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/heroes`);
  if (!res.ok) return [];
  return res.json();
}

export async function getPlayerPeers(accountId: string) {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/peers`);
  if (!res.ok) return [];
  return res.json();
}
