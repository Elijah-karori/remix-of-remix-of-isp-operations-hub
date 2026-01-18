import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  FolderPlus,
  ClipboardPlus,
  UserPlus,
  Package,
  FileText,
  Send,
  Calculator,
  ShoppingCart,
  ReceiptText, // For InvoiceForm
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LeadForm } from "@/components/crm/LeadForm";
import { InvoiceForm } from "@/components/finance/InvoiceForm";
import { ProjectForm } from "./forms/ProjectForm";
import { TaskForm } from "./forms/TaskForm";
import { PurchaseOrderForm } from "./forms/PurchaseOrderForm";
import { toast } from "sonner"; // Assuming sonner is preferred for toasts

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  dialogTitle: string;
  component: React.ElementType | string; // Can be a component or a string to indicate navigation
}

const actions: QuickAction[] = [
  { label: "New Project", icon: FolderPlus, color: "text-chart-1", bgColor: "bg-chart-1/10 hover:bg-chart-1/20", dialogTitle: "Create New Project", component: ProjectForm },
  { label: "Create Task", icon: ClipboardPlus, color: "text-chart-2", bgColor: "bg-chart-2/10 hover:bg-chart-2/20", dialogTitle: "Create New Task", component: TaskForm },
  { label: "Add Lead", icon: UserPlus, color: "text-chart-3", bgColor: "bg-chart-3/10 hover:bg-chart-3/20", dialogTitle: "Add New Lead", component: LeadForm },
  { label: "New Order", icon: ShoppingCart, color: "text-chart-4", bgColor: "bg-chart-4/10 hover:bg-chart-4/20", dialogTitle: "Create New Purchase Order", component: PurchaseOrderForm },
  { label: "Send Invoice", icon: Send, color: "text-primary", bgColor: "bg-primary/10 hover:bg-primary/20", dialogTitle: "Send New Invoice", component: InvoiceForm },
  { label: "Stock Check", icon: Package, color: "text-warning", bgColor: "bg-warning/10 hover:bg-warning/20", dialogTitle: "Stock Check", component: "navigate:/inventory" }, // Navigates to inventory
  { label: "Payroll", icon: Calculator, color: "text-success", bgColor: "bg-success/10 hover:bg-success/20", dialogTitle: "Payroll Operations", component: "navigate:/hr/payroll" }, // Navigates to HR Payroll
  { label: "Reports", icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted/50 hover:bg-muted", dialogTitle: "View Reports", component: "navigate:/finance/reports" }, // Navigates to Finance Reports
];

export function QuickActions() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleActionClick = (actionLabel: string, componentType: React.ElementType | string) => {
    if (typeof componentType === 'string' && componentType.startsWith('navigate:')) {
      const path = componentType.split(':')[1];
      navigate(path); // Use navigate for programmatic navigation
      return;
    }
    setOpenDialog(actionLabel);
  };

  const handleFormSuccess = (label: string) => {
    setOpenDialog(null);
    toast.success(`${label} completed successfully!`);
  };

  const handleFormCancel = () => {
    setOpenDialog(null);
    toast.info("Operation cancelled.");
  };

  return (
    <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 group",
              action.bgColor
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleActionClick(action.label, action.component)}
          >
            <action.icon
              className={cn("w-6 h-6 transition-transform group-hover:scale-110", action.color)}
            />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Dialogs for forms */}
      {actions.map((action) => {
        const FormComponent = action.component as React.ElementType; // Type assertion

        if (typeof FormComponent === 'string' && FormComponent.startsWith('navigate:')) {
          return null; // Navigation actions don't need a dialog here
        }

        return (
          <Dialog
            key={`dialog-${action.label}`}
            open={openDialog === action.label}
            onOpenChange={(isOpen) => !isOpen && setOpenDialog(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{action.dialogTitle}</DialogTitle>
                <DialogDescription>
                  {action.label === "New Project" && "Start a new infrastructure project."}
                  {action.label === "Create Task" && "Assign a new task to team members."}
                  {action.label === "Add Lead" && "Capture new potential customer information."}
                  {action.label === "New Order" && "Create a new purchase order for suppliers."}
                  {action.label === "Send Invoice" && "Generate and send an invoice to a client."}
                </DialogDescription>
              </DialogHeader>
              <FormComponent
                onSuccess={() => handleFormSuccess(action.label)}
                onCancel={() => handleFormCancel()}
              />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
