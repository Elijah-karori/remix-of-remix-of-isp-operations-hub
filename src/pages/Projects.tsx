import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Users,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface Project {
  id: number;
  name: string;
  customer: string;
  email: string;
  phone: string;
  type: "fiber" | "wireless" | "ppoe" | "hotspot" | "hybrid";
  status: "planning" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  team: number;
  budget: number;
  spent: number;
  startDate: string;
  deadline: string;
  location: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "Kilimani Fiber Installation",
    customer: "ABC Company Ltd",
    email: "contact@abc.com",
    phone: "+254700000001",
    type: "fiber",
    status: "in_progress",
    priority: "high",
    progress: 65,
    team: 4,
    budget: 500000,
    spent: 325000,
    startDate: "2026-01-01",
    deadline: "2026-01-25",
    location: "Kilimani, Nairobi",
  },
  {
    id: 2,
    name: "Westlands Office Network",
    customer: "Smith Enterprises",
    email: "info@smith.co.ke",
    phone: "+254700000002",
    type: "wireless",
    status: "planning",
    priority: "medium",
    progress: 15,
    team: 2,
    budget: 350000,
    spent: 52500,
    startDate: "2026-01-15",
    deadline: "2026-02-10",
    location: "Westlands, Nairobi",
  },
  {
    id: 3,
    name: "CBD Hotspot Deployment",
    customer: "City Mall",
    email: "tech@citymall.co.ke",
    phone: "+254700000003",
    type: "hotspot",
    status: "in_progress",
    priority: "critical",
    progress: 80,
    team: 3,
    budget: 200000,
    spent: 160000,
    startDate: "2025-12-20",
    deadline: "2026-01-18",
    location: "CBD, Nairobi",
  },
  {
    id: 4,
    name: "Karen Estate PPOE Setup",
    customer: "Karen Residences",
    email: "admin@karenres.co.ke",
    phone: "+254700000004",
    type: "ppoe",
    status: "completed",
    priority: "medium",
    progress: 100,
    team: 5,
    budget: 750000,
    spent: 720000,
    startDate: "2025-11-15",
    deadline: "2026-01-08",
    location: "Karen, Nairobi",
  },
  {
    id: 5,
    name: "Industrial Area Hybrid Network",
    customer: "Mombasa Cement",
    email: "it@mombcement.co.ke",
    phone: "+254700000005",
    type: "hybrid",
    status: "on_hold",
    priority: "low",
    progress: 40,
    team: 6,
    budget: 1200000,
    spent: 480000,
    startDate: "2025-12-01",
    deadline: "2026-03-01",
    location: "Industrial Area, Nairobi",
  },
];

const statusStyles = {
  planning: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  on_hold: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeStyles = {
  fiber: "bg-chart-1/10 text-chart-1",
  wireless: "bg-chart-2/10 text-chart-2",
  ppoe: "bg-chart-3/10 text-chart-3",
  hotspot: "bg-chart-4/10 text-chart-4",
  hybrid: "bg-chart-5/10 text-chart-5",
};

const priorityStyles = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-warning",
  critical: "text-destructive",
};

export default function Projects() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <DashboardLayout title="Projects" subtitle="Manage infrastructure deployments">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="fiber">Fiber</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
              <SelectItem value="ppoe">PPOE</SelectItem>
              <SelectItem value="hotspot">Hotspot</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="glass rounded-xl p-6 hover:shadow-glow hover:border-primary/30 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("text-xs", typeStyles[project.type])}>
                    {project.type.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", statusStyles[project.status])}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground">{project.customer}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.team} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{project.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <div className="text-right">
                <span className="font-medium text-foreground">
                  KES {project.spent.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {project.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
