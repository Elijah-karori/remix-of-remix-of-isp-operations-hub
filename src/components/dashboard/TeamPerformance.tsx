import { Wrench, Star, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Technician {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  tasksCompleted: number;
  efficiency: number;
  altitude: "bronze" | "silver" | "gold" | "platinum";
}

const technicians: Technician[] = [
  { id: 1, name: "James Mwangi", avatar: "JM", rating: 4.9, tasksCompleted: 45, efficiency: 96, altitude: "platinum" },
  { id: 2, name: "Sarah Ochieng", avatar: "SO", rating: 4.7, tasksCompleted: 38, efficiency: 92, altitude: "gold" },
  { id: 3, name: "Peter Kimani", avatar: "PK", rating: 4.5, tasksCompleted: 32, efficiency: 88, altitude: "silver" },
  { id: 4, name: "Grace Wanjiku", avatar: "GW", rating: 4.8, tasksCompleted: 41, efficiency: 94, altitude: "gold" },
];

const altitudeStyles = {
  bronze: "bg-amber-900/20 text-amber-600 border-amber-600/30",
  silver: "bg-gray-400/20 text-gray-400 border-gray-400/30",
  gold: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  platinum: "bg-primary/20 text-primary border-primary/30",
};

export function TeamPerformance() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Wrench className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Team Performance</h2>
            <p className="text-sm text-muted-foreground">Top technicians this month</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Leaderboard
        </Button>
      </div>

      <div className="space-y-4">
        {technicians.map((tech, index) => (
          <div
            key={tech.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-1 text-muted-foreground w-6">
              {index === 0 ? (
                <Award className="w-5 h-5 text-yellow-500" />
              ) : (
                <span className="text-sm font-medium">#{index + 1}</span>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">{tech.avatar}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground truncate">{tech.name}</p>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    altitudeStyles[tech.altitude]
                  }`}
                >
                  {tech.altitude}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{tech.rating}</span>
                </div>
                <span>{tech.tasksCompleted} tasks</span>
              </div>
            </div>

            <div className="w-24 flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-sm font-medium text-success">{tech.efficiency}%</span>
              </div>
              <Progress value={tech.efficiency} className="h-1.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
