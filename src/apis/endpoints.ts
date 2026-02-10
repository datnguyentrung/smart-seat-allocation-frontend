const API_VERSION_1 = "/api/v1";

export const endpoints = {
  auth: {
    login: `${API_VERSION_1}/auth/login`,
    register: `${API_VERSION_1}/auth/register`,
    refreshToken: `${API_VERSION_1}/auth/refresh`,
  },
  tournaments: {
    list: `${API_VERSION_1}/tournaments`,
    create: `${API_VERSION_1}/tournaments`,
    details: (tournamentId: string) =>
      `${API_VERSION_1}/tournaments/${tournamentId}`,
    update: (tournamentId: string) =>
      `${API_VERSION_1}/tournaments/${tournamentId}`,
    delete: (tournamentId: string) =>
      `${API_VERSION_1}/tournaments/${tournamentId}`,
  },
  tournamentMatch: {
    create: `${API_VERSION_1}/tournament-matches`,
  },
  bracketNodes: {
    byParticipants: (participants: number) =>
      `${API_VERSION_1}/bracket-nodes/participants/${participants}`,
  },
  poomsaeCombinations: {
    list: `${API_VERSION_1}/poomsae-combinations`,
    byTournament: `${API_VERSION_1}/poomsae-combinations/tournament`,
    create: `${API_VERSION_1}/poomsae-combinations`,
    delete: (combinationId: string) =>
      `${API_VERSION_1}/poomsae-combinations/${combinationId}`,
  },
  poomsaeList: {
    byFilter: `${API_VERSION_1}/poomsae-lists/filter`,
    create: `${API_VERSION_1}/poomsae-lists`,
  },
  sparringList: {
    byFilter: `${API_VERSION_1}/sparring-lists/filter`,
    create: `${API_VERSION_1}/sparring-lists`,
  },
  poomsaeHistory: {
    deleteForElimination: (id: string) =>
      `${API_VERSION_1}/poomsae-histories/elimination/${id}`,
    createForElimination: `${API_VERSION_1}/poomsae-histories/elimination`,
    createWinnerForElimination: (winnerId: string) =>
      `${API_VERSION_1}/poomsae-histories/elimination/winner/${winnerId}`,
    checkExistence: `${API_VERSION_1}/poomsae-histories/check-existence`,
    filter: `${API_VERSION_1}/poomsae-histories/filter`,
  },
  sparringHistory: {
    delete: (id: string) => `${API_VERSION_1}/sparring-histories/${id}`,
    create: `${API_VERSION_1}/sparring-histories/elimination`,
    existByFilter: `${API_VERSION_1}/sparring-histories/exists`,
  },
  student: {
    search: `${API_VERSION_1}/students/search`,
  },
};
