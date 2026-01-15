// Mock data for demo mode when backend is unavailable

export const DEMO_USER = {
  id: 1,
  email: "demo@example.com",
  full_name: "Demo User",
  phone: "+254700000000",
  is_active: true,
  department_id: 1,
};

export const DEMO_PERMISSIONS = [
  "projects:read",
  "projects:write",
  "tasks:read",
  "tasks:write",
  "inventory:read",
  "finance:read",
  "dashboard:read",
];

export const DEMO_PROJECTS = [
  {
    id: 1,
    name: "Fiber Network Expansion - Westlands",
    status: "in_progress",
    infrastructure_type: "fiber",
    budget: 2500000,
    spent: 1850000,
    progress: 74,
    start_date: "2025-01-15",
    end_date: "2025-06-30",
    department_id: 1,
  },
  {
    id: 2,
    name: "Tower Installation - Kilimani",
    status: "planning",
    infrastructure_type: "tower",
    budget: 4200000,
    spent: 420000,
    progress: 10,
    start_date: "2025-02-01",
    end_date: "2025-08-15",
    department_id: 1,
  },
  {
    id: 3,
    name: "Network Upgrade - CBD",
    status: "completed",
    infrastructure_type: "network",
    budget: 1800000,
    spent: 1720000,
    progress: 100,
    start_date: "2024-10-01",
    end_date: "2025-01-10",
    department_id: 2,
  },
];

export const DEMO_TASKS = [
  {
    id: 1,
    title: "Survey site for tower placement",
    description: "Conduct site survey and soil analysis",
    status: "in_progress",
    priority: "high",
    project_id: 2,
    assigned_to: 1,
    due_date: "2025-01-20",
    hours_logged: 8,
  },
  {
    id: 2,
    title: "Install fiber cables - Phase 1",
    description: "Install underground fiber optic cables",
    status: "pending",
    priority: "high",
    project_id: 1,
    assigned_to: 1,
    due_date: "2025-01-25",
    hours_logged: 0,
  },
  {
    id: 3,
    title: "Equipment testing",
    description: "Test all network equipment before deployment",
    status: "completed",
    priority: "medium",
    project_id: 3,
    assigned_to: 1,
    due_date: "2025-01-05",
    hours_logged: 12,
  },
];

export const DEMO_INVENTORY = {
  products: [
    {
      id: 1,
      name: "Fiber Optic Cable (100m)",
      sku: "FOC-100",
      category: "Cables",
      quantity: 45,
      min_stock_level: 20,
      unit_price: 8500,
      supplier_id: 1,
    },
    {
      id: 2,
      name: "Network Switch 24-Port",
      sku: "NS-24P",
      category: "Equipment",
      quantity: 8,
      min_stock_level: 5,
      unit_price: 45000,
      supplier_id: 2,
    },
    {
      id: 3,
      name: "Patch Panel 48-Port",
      sku: "PP-48P",
      category: "Equipment",
      quantity: 3,
      min_stock_level: 10,
      unit_price: 12000,
      supplier_id: 1,
    },
  ],
  suppliers: [
    {
      id: 1,
      name: "TechSupply Kenya",
      contact_email: "sales@techsupply.co.ke",
      contact_phone: "+254722111222",
      is_active: true,
    },
    {
      id: 2,
      name: "Network Solutions Ltd",
      contact_email: "info@netsolutions.co.ke",
      contact_phone: "+254733222333",
      is_active: true,
    },
  ],
  lowStock: [
    {
      id: 3,
      name: "Patch Panel 48-Port",
      quantity: 3,
      min_stock_level: 10,
      reorder_needed: 7,
    },
  ],
};

export const DEMO_FINANCE = {
  snapshot: {
    total_revenue: 15800000,
    total_expenses: 12400000,
    pending_invoices: 2340000,
    pending_payments: 1850000,
    profit_margin: 21.5,
  },
  budgetTracking: {
    total_budget: 8500000,
    total_spent: 5990000,
    remaining: 2510000,
    projects: DEMO_PROJECTS.map((p) => ({
      project_id: p.id,
      project_name: p.name,
      budget: p.budget,
      spent: p.spent,
      utilization: Math.round((p.spent / p.budget) * 100),
    })),
  },
};

export const DEMO_DASHBOARD = {
  projectsOverview: {
    total: 3,
    in_progress: 1,
    planning: 1,
    completed: 1,
    on_hold: 0,
  },
  taskAllocation: {
    total: 3,
    pending: 1,
    in_progress: 1,
    completed: 1,
    overdue: 0,
  },
  teamWorkload: [
    { employee_id: 1, name: "Demo User", assigned_tasks: 3, completed: 1 },
    { employee_id: 2, name: "John Doe", assigned_tasks: 5, completed: 3 },
    { employee_id: 3, name: "Jane Smith", assigned_tasks: 4, completed: 2 },
  ],
};

// Simulate network delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
