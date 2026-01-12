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
  LayoutGrid,
  List,
  Clock,
  Users,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useProjects, type ProjectsFilters } from "@/hooks/use-projects";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

const statusStyles: Record<string, string> = {
  planning: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  on_hold: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeStyles: Record<string, string> = {
  fiber: "bg-chart-1/10 text-chart-1",
  wireless: "bg-chart-2/10 text-chart-2",
  ppoe: "bg-chart-3/10 text-chart-3",
  hotspot: "bg-chart-4/10 text-chart-4",
  hybrid: "bg-chart-5/10 text-chart-5",
  network_infrastructure: "bg-primary/10 text-primary",
};

export default function Projects() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters: ProjectsFilters = {};
  if (statusFilter !== "all") filters.status = statusFilter;
  if (typeFilter !== "all") filters.infrastructure_type = typeFilter;

  const { data: projects, isLoading, error, refetch } = useProjects(filters);

  const filteredProjects = (projects || []).filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Projects" subtitle="Manage infrastructure deployments">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-secondary border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
      {isLoading ? (
        <div className={cn("grid gap-6", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
          <LoadingSkeleton variant="card" count={6} />
        </div>
      ) : error ? (
        <ErrorState message="Failed to load projects" onRetry={() => refetch()} />
      ) : filteredProjects.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : (
        <div className={cn("grid gap-6", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="glass rounded-xl p-6 hover:shadow-glow hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", typeStyles[project.infrastructure_type] || typeStyles.fiber)}>
                      {project.infrastructure_type?.toUpperCase() || "N/A"}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", statusStyles[project.status] || statusStyles.planning)}>
                      {project.status?.replace("_", " ") || "Unknown"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.customer_name}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                {project.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.team_size || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : "No deadline"}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">{project.progress || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <div className="text-right">
                  <span className="font-medium text-foreground">KES {(project.spent || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground"> / {(project.budget || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
