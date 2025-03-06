
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface TournamentCardProps {
  name: string;
  status: "upcoming" | "ongoing" | "completed";
  startDate: string;
  endDate: string;
  prizePool: string;
  teams: number;
}

export const TournamentCard = ({ 
  name, 
  status, 
  startDate,
  endDate,
  prizePool, 
  teams 
}: TournamentCardProps) => {
  const statusColors = {
    upcoming: "text-blue-400",
    ongoing: "text-green-400",
    completed: "text-gray-400",
  };

  return (
    <Card className="glass-card p-6 transition-all duration-300 hover:scale-105 cursor-pointer">
      <h3 className="valorant-title text-xl mb-4 text-valorant-white">{name}</h3>
      <div className="space-y-3">
        <p className={`${statusColors[status]} font-semibold uppercase text-sm`}>
          {status}
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-valorant-white/80">
            {format(new Date(startDate), "MMM d, yyyy")} - {format(new Date(endDate), "MMM d, yyyy")}
          </p>
          <p className="text-valorant-white/80">Prize Pool: {prizePool}</p>
          <p className="text-valorant-white/80">{teams} Teams</p>
        </div>
      </div>
    </Card>
  );
};
