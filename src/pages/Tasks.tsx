import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Clock,
  User,
  FolderKanban,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "awaiting_approval" | "completed";
  assignedRole: string;
  assignee?: string;
  estimatedHours: number;
  actualHours?: number;
  dueDate: string;
  items: { name: string; quantity: number }[];
}

const tasksByStatus: Record<string, Task[]> = {
  pending: [
    {
      id: 1,
      title: "Configure router settings",
      description: "Set up DHCP, DNS, and firewall rules",
      project: "Westlands Network",
      priority: "medium",
      status: "pending",
      assignedRole: "Tech Lead",
      estimatedHours: 4,
      dueDate: "2026-01-12",
      items: [{ name: "Router Config Template", quantity: 1 }],
    },
    {
      id: 2,
      title: "Document installation process",
      description: "Create technical documentation for handover",
      project: "Karen Estate",
      priority: "low",
      status: "pending",
      assignedRole: "Project Manager",
      estimatedHours: 2,
      dueDate: "2026-01-15",
      items: [],
    },
  ],
  in_progress: [
    {
      id: 3,
      title: "Install fiber optic cables - Section A",
      description: "Run 500m of fiber from junction box to building A",
      project: "Kilimani Fiber",
      priority: "high",
      status: "in_progress",
      assignedRole: "Technician",
      assignee: "James Mwangi",
      estimatedHours: 8,
      actualHours: 5,
      dueDate: "2026-01-10",
      items: [
        { name: "Fiber Cable", quantity: 500 },
        { name: "Connectors", quantity: 20 },
      ],
    },
    {
      id: 4,
      title: "Verify signal strength",
      description: "Test and document signal quality across all access points",
      project: "Kilimani Fiber",
      priority: "high",
      status: "in_progress",
      assignedRole: "Technician",
      assignee: "Peter Kimani",
      estimatedHours: 3,
      actualHours: 1.5,
      dueDate: "2026-01-10",
      items: [{ name: "Signal Tester", quantity: 1 }],
    },
  ],
  awaiting_approval: [
    {
      id: 5,
      title: "Test network connectivity",
      description: "Full network connectivity test and validation",
      project: "CBD Hotspot",
      priority: "critical",
      status: "awaiting_approval",
      assignedRole: "Technician",
      assignee: "Sarah Ochieng",
      estimatedHours: 2,
      actualHours: 2.5,
      dueDate: "2026-01-10",
      items: [],
    },
  ],
  completed: [
    {
      id: 6,
      title: "Mount access points",
      description: "Install and secure 10 access points in designated locations",
      project: "CBD Hotspot",
      priority: "high",
      status: "completed",
      assignedRole: "Technician",
      assignee: "Grace Wanjiku",
      estimatedHours: 6,
      actualHours: 5.5,
      dueDate: "2026-01-08",
      items: [{ name: "Access Point", quantity: 10 }],
    },
  ],
};

const statusConfig = {
  pending: { label: "Pending", color: "bg-muted", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-primary", icon: Clock },
  awaiting_approval: { label: "Awaiting Approval", color: "bg-warning", icon: AlertTriangle },
  completed: { label: "Completed", color: "bg-success", icon: CheckCircle2 },
};

const priorityStyles = {
  low: "text-muted-foreground bg-muted/50",
  medium: "text-primary bg-primary/10",
  high: "text-warning bg-warning/10",
  critical: "text-destructive bg-destructive/10",
};

export default function Tasks() {
  return (
    <DashboardLayout title="Tasks" subtitle="Manage and track work items">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const StatusIcon = config.icon;
          const tasks = tasksByStatus[status] || [];

          return (
            <div key={status} className="flex flex-col">
              {/* Column Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-3 h-3 rounded-full", config.color)} />
                <h3 className="font-semibold text-foreground">{config.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {tasks.length}
                </Badge>
              </div>

              {/* Tasks */}
              <div className="space-y-3 flex-1">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="glass rounded-xl p-4 hover:border-primary/30 transition-all duration-200 cursor-pointer group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn("text-xs", priorityStyles[task.priority])}>
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground text-sm leading-snug">
                          {task.title}
                        </h4>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        <span className="truncate max-w-20">{task.project}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </div>

                    {task.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.items.slice(0, 2).map((item, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {task.items.length > 2 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            +{task.items.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {task.assignee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-20">
                            {task.assignee}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{task.assignedRole}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center p-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
