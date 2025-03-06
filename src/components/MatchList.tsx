
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Globe2 } from "lucide-react";

interface Team {
  name: string;
  flag?: string;
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
  date: string;
  status: "upcoming" | "live" | "finished";
  stage: string;
}

interface MatchListProps {
  matches: Match[];
  title: string;
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

export const MatchList = ({ matches, title }: MatchListProps) => {
  // Group matches by stage
  const matchesByStage = matches.reduce((acc, match) => {
    if (!acc[match.stage]) {
      acc[match.stage] = [];
    }
    acc[match.stage].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-6">
      <h2 className="valorant-title text-2xl text-valorant-white">{title}</h2>
      {Object.entries(matchesByStage).map(([stage, stageMatches]) => (
        <div key={stage} className="space-y-4">
          <h3 className="text-lg font-semibold text-valorant-white/80">{stage}</h3>
          <div className="grid gap-4">
            {stageMatches.map((match) => (
              <Card key={match.id} className="glass-card p-6 hover:bg-valorant-white/5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right flex items-center justify-end gap-3">
                    <span className="text-valorant-white">{match.team1.name}</span>
                    {getFlagIcon(match.team1.flag)}
                  </div>
                  <div className="mx-6 flex flex-col items-center">
                    <span className="text-sm text-valorant-white/60 mb-1">
                      {format(new Date(match.date), "MMM d, HH:mm")}
                    </span>
                    {match.status === "live" && (
                      <span className="animate-pulse text-valorant-red font-semibold text-sm">LIVE</span>
                    )}
                  </div>
                  <div className="flex-1 text-left flex items-center gap-3">
                    {getFlagIcon(match.team2.flag)}
                    <span className="text-valorant-white">{match.team2.name}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
