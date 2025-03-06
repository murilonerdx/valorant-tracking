
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe2, MapPin } from "lucide-react";

interface TeamStanding {
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

interface StandingsProps {
  matches: TeamStanding[];
}

const FLAG_ICONS: Record<string, string> = {
  flag_uk: '🇬🇧',
  flag_us: '🇺🇸',
  flag_br: '🇧🇷',
  flag_tr: '🇹🇷',
  flag_fr: '🇫🇷',
  flag_de: '🇩🇪',
  flag_es: '🇪🇸',
  flag_it: '🇮🇹',
  flag_pt: '🇵🇹',
  flag_jp: '🇯🇵',
  flag_kr: '🇰🇷',
  flag_cn: '🇨🇳',
  flag_ru: '🇷🇺',
};

const getFlagIcon = (flagCode?: string) => {
  if (!flagCode || !FLAG_ICONS[flagCode]) {
    return <Globe2 className="w-4 h-4 text-valorant-white/80" />;
  }
  return <span className="text-lg">{FLAG_ICONS[flagCode]}</span>;
};

export const Standings = ({ matches }: StandingsProps) => {
  // Get all unique matches
  const recentMatches = matches.reduce<Array<{ team1: string, team1Flag?: string, team2: string, team2Flag?: string, score: string, team1Won: boolean }>>((acc, team) => {
    team.matches.forEach(match => {
      // Check if this match (or its reverse) is already in the accumulator
      const matchExists = acc.some(
        m => (m.team1 === team.name && m.team2 === match.opponent) ||
             (m.team2 === team.name && m.team1 === match.opponent)
      );

      if (!matchExists) {
        acc.push({
          team1: team.name,
          team1Flag: team.flag,
          team2: match.opponent,
          team2Flag: match.opponentFlag,
          score: match.score,
          team1Won: match.won
        });
      }
    });
    return acc;
  }, []);

  return (
    <div className="h-full flex flex-col">
      <h2 className="valorant-title text-2xl mb-4">Recent Matches</h2>
      <div className="flex-1 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-valorant-red/10">
              <TableHead className="text-valorant-white text-lg py-4">Recent Matches</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-valorant-red/5 transition-all duration-300">
              <TableCell className="p-2">
                <div className="flex flex-col gap-3">
                  {recentMatches.map((match, idx) => {
                    const [score1, score2] = match.score.split('-').map(s => s.trim());
                    const isDraw = score1 === score2;

                    return (
                      <div key={idx} className="flex items-center w-full text-base">
                        <div className="flex items-center justify-between w-full px-4 gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFlagIcon(match.team1Flag)}
                            <span className={`font-semibold truncate ${
                              isDraw 
                                ? 'text-gray-400'
                                : match.team1Won 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                            }`}>
                              {match.team1}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 px-4 flex-shrink-0">
                            <span className="text-valorant-white/80 font-bold">
                              {score1}
                            </span>
                            <span className="text-valorant-white/80 font-bold">vs</span>
                            <span className="text-valorant-white/80 font-bold">
                              {score2}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <span className={`font-semibold truncate ${
                              isDraw 
                                ? 'text-gray-400'
                                : match.team1Won 
                                  ? 'text-red-400' 
                                  : 'text-green-400'
                            }`}>
                              {match.team2}
                            </span>
                            {getFlagIcon(match.team2Flag)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
