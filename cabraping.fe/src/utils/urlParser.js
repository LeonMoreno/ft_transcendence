export function parseTournamentIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tournamentId');
  }
  