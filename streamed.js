/**
 * streamed.js - Streamed.pk Integration Module
 */

let matchesDataCache = [];

/**
 * Normalizes strings by removing special characters and standard filler words.
 */
function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(fc|vs|the|team)\b/g, '')
    .trim();
}

/**
 * Executes a multi-token fuzzy search to match ESPN teams against streamed.pk titles.
 */
function findMatchingStream(homeTeam, awayTeam) {
  if (!matchesDataCache || matchesDataCache.length === 0) return null;

  const homeTokens = [
    homeTeam?.displayName,
    homeTeam?.name,
    homeTeam?.shortDisplayName,
    homeTeam?.abbreviation
  ].map(normalizeText).filter(Boolean);

  const awayTokens = [
    awayTeam?.displayName,
    awayTeam?.name,
    awayTeam?.shortDisplayName,
    awayTeam?.abbreviation
  ].map(normalizeText).filter(Boolean);

  let bestMatch = null;
  let highestScore = 0;

  for (const match of matchesDataCache) {
    const titleNorm = normalizeText(match.title);
    let currentScore = 0;

    const homeFound = homeTokens.some(token => token.length > 2 && titleNorm.includes(token));
    const awayFound = awayTokens.some(token => token.length > 2 && titleNorm.includes(token));

    if (homeFound && awayFound) {
      currentScore = 10;
    } else if (homeFound || awayFound) {
      currentScore = 4;
    }

    if (currentScore > highestScore) {
      highestScore = currentScore;
      bestMatch = match;
    }
  }

  return highestScore >= 4 ? bestMatch : null;
}

/**
 * Fetches current live streams from streamed.pk API.
 */
async function fetchLiveStreams() {
  try {
    const freshStreams = await fetch('https://streamed.pk/api/matches/live').then(r => r.json());
    matchesDataCache = freshStreams || [];
    return matchesDataCache;
  } catch (e) {
    console.warn("streamed.pk live fetch error:", e);
    return [];
  }
}

/**
 * Fetches source embed URL for player.
 */
async function fetchStreamEmbedUrl(source, id) {
  try {
    const res = await fetch(`https://streamed.pk/api/stream/${source}/${id}`).then(r => r.json());
    if (res && res.length > 0 && res[0].embedUrl) {
      return res[0].embedUrl;
    }
  } catch (e) {
    console.error("Error fetching stream embed:", e);
  }
  return null;
}
