
import { useState, useEffect } from "react";
import { TournamentCard } from "@/components/TournamentCard";
import { Standings } from "@/components/Standings";
import { MatchList } from "@/components/MatchList";
import { useTournaments, useStandings, useMatches } from "@/services/tournamentApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

const Index = () => {
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const { toast } = useToast();

  const { 
    data: tournaments, 
    isLoading: isLoadingTournaments,
    refetch: refetchTournaments,
    error: tournamentsError 
  } = useTournaments();

  const { 
    data: standings, 
    isLoading: isLoadingStandings,
    refetch: refetchStandings,
    error: standingsError 
  } = useStandings(selectedTournament);

  const { 
    data: matches, 
    isLoading: isLoadingMatches,
    refetch: refetchMatches,
    error: matchesError 
  } = useMatches(selectedTournament);

  // Fetch tournaments on component mount
  useEffect(() => {
    console.log("Fetching tournaments...");
    refetchTournaments();
  }, []);

  // Fetch standings and matches when selectedTournament changes
  useEffect(() => {
    if (selectedTournament) {
      console.log(`Fetching data for tournament: ${selectedTournament}`);
      refetchStandings();
      refetchMatches();
    }
  }, [selectedTournament]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (tournamentsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tournaments. Please try again later.",
      });
    }

    if (standingsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load standings. Please try again later.",
      });
    }

    if (matchesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load matches. Please try again later.",
      });
    }
  }, [tournamentsError, standingsError, matchesError, toast]);

  const handleTournamentSelect = (tournamentId: string) => {
    if (tournamentId !== selectedTournament) {
      setSelectedTournament(tournamentId);
    }
  };

  return (
    <div className="min-h-screen container py-12 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <Trophy className="w-12 h-12 text-valorant-red animate-pulse" />
          <h1 className="valorant-title text-6xl lg:text-7xl">VALORANT TOURNAMENTS</h1>
        </div>
        <p className="text-valorant-white/60 text-lg max-w-2xl mx-auto">
          Track professional Valorant tournaments worldwide
        </p>
      </header>

      <section className="space-y-8">
        <h2 className="valorant-title text-3xl mb-8 relative inline-block">
          Featured Tournaments
          <span className="absolute bottom-0 left-0 w-full h-1 bg-valorant-red/50 -mb-2"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingTournaments ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))
          ) : tournaments?.map((tournament) => (
            <div 
              key={tournament.id} 
              onClick={() => handleTournamentSelect(tournament.id)}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <TournamentCard {...tournament} />
            </div>
          ))}
        </div>
      </section>

      {selectedTournament && (
        <section className="grid md:grid-cols-2 gap-12">
          {isLoadingStandings ? (
            <Skeleton className="h-96" />
          ) : standings && (
            <div className="glass-card p-6 rounded-xl">
              <Standings matches={standings} />
            </div>
          )}
          
          {isLoadingMatches ? (
            <Skeleton className="h-96" />
          ) : matches && (
            <div className="glass-card p-6 rounded-xl">
              <MatchList 
                title="Tournament Matches" 
                matches={matches.sort((a, b) => {
                  if (a.stage !== b.stage) {
                    return a.stage.localeCompare(b.stage);
                  }
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                })}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Index;
