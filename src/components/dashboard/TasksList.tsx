import { CheckSquare, Circle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  project: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "awaiting_approval" | "completed";
  assignedRole: string;
  dueDate: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Install fiber optic cables - Section A",
    project: "Kilimani Fiber",
    priority: "high",
    status: "in_progress",
    assignedRole: "Technician",
    dueDate: "Today",
  },
  {
    id: 2,
    title: "Configure router settings",
    project: "Westlands Network",
    priority: "medium",
    status: "pending",
    assignedRole: "Tech Lead",
    dueDate: "Tomorrow",
  },
  {
    id: 3,
    title: "Test network connectivity",
    project: "CBD Hotspot",
    priority: "critical",
    status: "awaiting_approval",
    assignedRole: "Technician",
    dueDate: "Today",
  },
  {
    id: 4,
    title: "Document installation process",
    project: "Karen Estate",
    priority: "low",
    status: "pending",
    assignedRole: "Project Manager",
    dueDate: "Jan 15",
  },
  {
    id: 5,
    title: "Verify signal strength",
    project: "Kilimani Fiber",
    priority: "high",
    status: "in_progress",
    assignedRole: "Technician",
    dueDate: "Today",
  },
];

const priorityStyles = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-warning",
  critical: "text-destructive",
};

const priorityIcons = {
  low: Circle,
  medium: Circle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

const statusStyles = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  awaiting_approval: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

export function TasksList() {
  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">My Tasks</h2>
            <p className="text-sm text-muted-foreground">Assigned to you</p>
          </div>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/20">
          {tasks.filter((t) => t.status !== "completed").length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => {
          const PriorityIcon = priorityIcons[task.priority];
          return (
            <div
              key={task.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  task.status === "completed"
                    ? "bg-success/20"
                    : "bg-secondary border-2 border-border group-hover:border-primary/50"
                )}
              >
                {task.status === "completed" ? (
                  <CheckSquare className="w-4 h-4 text-success" />
                ) : (
                  <PriorityIcon
                    className={cn("w-4 h-4", priorityStyles[task.priority])}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium truncate",
                    task.status === "completed"
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  )}
                >
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">{task.project}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={cn("text-xs", statusStyles[task.status])}>
                  {task.status.replace("_", " ")}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.dueDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-primary">
        View All Tasks
      </Button>
    </div>
  );
}
