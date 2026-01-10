import { FolderKanban, MoreHorizontal, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  customer: string;
  type: "fiber" | "wireless" | "ppoe" | "hotspot" | "hybrid";
  status: "planning" | "in_progress" | "completed" | "on_hold";
  progress: number;
  team: number;
  deadline: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "Kilimani Fiber Installation",
    customer: "ABC Company Ltd",
    type: "fiber",
    status: "in_progress",
    progress: 65,
    team: 4,
    deadline: "Jan 25, 2026",
  },
  {
    id: 2,
    name: "Westlands Office Network",
    customer: "Smith Enterprises",
    type: "wireless",
    status: "planning",
    progress: 15,
    team: 2,
    deadline: "Feb 10, 2026",
  },
  {
    id: 3,
    name: "CBD Hotspot Deployment",
    customer: "City Mall",
    type: "hotspot",
    status: "in_progress",
    progress: 80,
    team: 3,
    deadline: "Jan 18, 2026",
  },
  {
    id: 4,
    name: "Karen Estate PPOE Setup",
    customer: "Residential Complex",
    type: "ppoe",
    status: "completed",
    progress: 100,
    team: 5,
    deadline: "Jan 8, 2026",
  },
];

const statusStyles = {
  planning: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  on_hold: "bg-muted text-muted-foreground border-border",
};

const typeStyles = {
  fiber: "bg-chart-1/10 text-chart-1",
  wireless: "bg-chart-2/10 text-chart-2",
  ppoe: "bg-chart-3/10 text-chart-3",
  hotspot: "bg-chart-4/10 text-chart-4",
  hybrid: "bg-chart-5/10 text-chart-5",
};

export function RecentProjects() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
            <p className="text-sm text-muted-foreground">Active infrastructure deployments</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{project.name}</h3>
                  <Badge className={cn("text-xs", typeStyles[project.type])}>
                    {project.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{project.customer}</p>
              </div>
              <Badge variant="outline" className={cn("text-xs", statusStyles[project.status])}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{project.team}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{project.deadline}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
