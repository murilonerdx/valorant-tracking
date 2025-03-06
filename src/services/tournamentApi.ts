
import { useQuery } from "@tanstack/react-query";

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  prizePool: string;
  status: "upcoming" | "ongoing" | "completed";
  teams: number;
}

export interface Team {
  name: string;
  flag?: string;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  date: string;
  status: "upcoming" | "live" | "finished";
  tournamentId: string;
  stage: string;
  matchPage?: string;
}

export interface TeamStanding {
  name: string;
  flag?: string;
  wins: number;
  losses: number;
  matches: {
    opponent: string;
    opponentFlag?: string;
    won: boolean;
    score: string;
  }[];
}

const API_BASE_URL = "http://vlrggapi.vercel.app";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

const fetchWithCors = async (endpoint: string) => {
  try {
    const encodedUrl = encodeURIComponent(`${API_BASE_URL}${endpoint}`);
    const proxyUrl = `${CORS_PROXY}${encodedUrl}`;
    
    console.log("Fetching from proxy URL:", proxyUrl);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !data.data.segments) {
      throw new Error('Invalid API response format');
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error('Failed to fetch data from API');
  }
};

// Process JSON data to create tournaments
const processMatchesToTournaments = (matches: any[]): Tournament[] => {
  if (!Array.isArray(matches)) {
    console.error("Invalid matches data:", matches);
    return [];
  }

  const tournamentMap = new Map<string, Tournament>();
  
  matches.forEach(match => {
    if (!tournamentMap.has(match.match_event)) {
      tournamentMap.set(match.match_event, {
        id: match.match_event,
        name: match.match_event,
        startDate: new Date().toISOString().split('T')[0], // Using current date as start
        endDate: new Date(match.unix_timestamp).toISOString().split('T')[0],
        location: "TBD",
        prizePool: "TBD",
        status: "upcoming",
        teams: 8 // Default value
      });
    }
  });

  return Array.from(tournamentMap.values());
};

// Process JSON data to create matches
const processMatches = (matches: any[]): Match[] => {
  if (!Array.isArray(matches)) {
    console.error("Invalid matches data:", matches);
    return [];
  }

  return matches.map(match => ({
    id: match.match_page?.split('/')[3] || String(Math.random()),
    team1: {
      name: match.team1 || 'TBD',
      flag: match.flag1
    },
    team2: {
      name: match.team2 || 'TBD',
      flag: match.flag2
    },
    date: new Date(match.unix_timestamp || Date.now()).toISOString(),
    status: match.time_until_match?.includes("from now") ? "upcoming" : "finished",
    tournamentId: match.match_event || match.tournament_name,
    stage: match.match_series || match.round_info || 'Unknown Stage',
    matchPage: match.match_page
  }));
};

// Calculate standings from completed matches
const calculateStandings = (matches: any[]): TeamStanding[] => {
  if (!Array.isArray(matches)) {
    console.error("Invalid matches data for standings:", matches);
    return [];
  }

  const standingsMap = new Map<string, TeamStanding>();

  matches.forEach(match => {
    if (!match.team1 || !match.team2) return;

    // Process team1
    if (!standingsMap.has(match.team1)) {
      standingsMap.set(match.team1, {
        name: match.team1,
        flag: match.flag1,
        wins: 0,
        losses: 0,
        matches: []
      });
    }

    // Process team2
    if (!standingsMap.has(match.team2)) {
      standingsMap.set(match.team2, {
        name: match.team2,
        flag: match.flag2,
        wins: 0,
        losses: 0,
        matches: []
      });
    }

    const team1Won = Number(match.score1) > Number(match.score2);
    
    // Update team1 data
    const team1Data = standingsMap.get(match.team1)!;
    if (team1Won) team1Data.wins++;
    else team1Data.losses++;
    team1Data.matches.push({
      opponent: match.team2,
      opponentFlag: match.flag2,
      won: team1Won,
      score: `${match.score1}-${match.score2}`
    });

    // Update team2 data
    const team2Data = standingsMap.get(match.team2)!;
    if (!team1Won) team2Data.wins++;
    else team2Data.losses++;
    team2Data.matches.push({
      opponent: match.team1,
      opponentFlag: match.flag1,
      won: !team1Won,
      score: `${match.score2}-${match.score1}`
    });
  });

  return Array.from(standingsMap.values());
};

// API functions with real endpoints
export const useTournaments = () => {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      console.log("Fetching upcoming matches...");
      const data = await fetchWithCors("/match?q=upcoming");
      return processMatchesToTournaments(data.data.segments);
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 300000 // 5 minutes
  });
};

export const useStandings = (tournamentId: string) => {
  return useQuery({
    queryKey: ["standings", tournamentId],
    queryFn: async () => {
      console.log("Fetching completed matches...");
      const data = await fetchWithCors("/match?q=results");
      return calculateStandings(data.data.segments.filter(
        (match: any) => match.tournament_name === tournamentId
      ));
    },
    enabled: !!tournamentId,
    retry: 3,
    retryDelay: 1000,
    staleTime: 300000 // 5 minutes
  });
};

export const useMatches = (tournamentId: string) => {
  return useQuery({
    queryKey: ["matches", tournamentId],
    queryFn: async () => {
      console.log("Fetching all matches for tournament:", tournamentId);
      try {
        const [upcomingData, completedData] = await Promise.all([
          fetchWithCors("/match?q=upcoming"),
          fetchWithCors("/match?q=results")
        ]);

        const allMatches = [
          ...(upcomingData.data.segments || []),
          ...(completedData.data.segments || [])
        ];

        return processMatches(
          allMatches.filter((match: any) => 
            match.match_event === tournamentId || 
            match.tournament_name === tournamentId
          )
        );
      } catch (error) {
        console.error("Error fetching matches:", error);
        throw new Error('Failed to load matches. Please try again later.');
      }
    },
    enabled: !!tournamentId,
    retry: 3,
    retryDelay: 1000,
    staleTime: 300000 // 5 minutes
  });
};
