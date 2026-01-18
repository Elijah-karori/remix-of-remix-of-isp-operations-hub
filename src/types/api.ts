// Common Types
export type ID = number;
export type DateString = string; // ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

// --- Auth & Users ---
export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: ID;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  roles: Role[]; // Old RBAC structure
  roles_v2?: RoleV2Out[]; // New RBAC structure
  menus?: MenuItem[]; // Dynamic frontend navigation
  created_at: DateString;
}

export interface UserCreate {
  email: string;
  password?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  role_id?: number;
  department_id?: number;
  phone_number?: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  role_id?: number;
  department_id?: number;
  phone_number?: string;
  avatar_url?: string;
}

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

// --- RBAC (Role-Based Access Control) ---
export interface Role { // Old RBAC Role structure
  id: ID;
  name: string;
  description?: string;
  permissions: string[];
  created_at: DateString;
}

export interface RoleV2Out { // New RBAC Role structure
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  scopes: string[];
}

export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  parent_role_id?: ID;
  depth: number;
}

export interface PermissionCheck {
  permission: string;
  granted: boolean;
}

export interface PermissionCheckResponse {
  permission: string;
  granted: boolean;
}

export interface PermissionDetail {
  codename: string;
  name: string;
}

export interface MyPermissionsResponse {
  permissions: PermissionDetail[];
  count: number;
}

// --- Projects ---
export type InfrastructureType = 'fiber' | 'wireless' | 'ppoe' | 'hotspot' | 'hybrid';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectOut {
  id: ID;
  name: string;
  project_type?: 'apartment' | 'single_home' | 'commercial';
  status: ProjectStatus;
  priority: ProjectPriority;
  infrastructure_type?: InfrastructureType;
  division_id?: ID;
  department_id?: ID;
  project_manager_id?: ID;
  tech_lead_id?: ID;
  budget?: string; // Decimal string
  actual_cost?: string; // Decimal string
  created_at: DateString;
  location_lat?: number;
  location_lng?: number;
  coverage_radius?: number;
  completion_percentage?: number;
  health_score?: number;
}

export interface ProjectCreate {
  name: string;
  project_type?: 'apartment' | 'single_home' | 'commercial';
  status?: ProjectStatus;
  priority?: ProjectPriority;
  infrastructure_type?: InfrastructureType;
  division_id?: ID;
  department_id?: ID;
  project_manager_id?: ID;
  tech_lead_id?: ID;
  budget?: string;
  location_lat?: number;
  location_lng?: number;
  coverage_radius?: number;
}

export interface ProjectUpdate {
  name?: string;
  project_type?: 'apartment' | 'single_home' | 'commercial';
  status?: ProjectStatus;
  priority?: ProjectPriority;
  infrastructure_type?: InfrastructureType;
  division_id?: ID;
  department_id?: ID;
  project_manager_id?: ID;
  tech_lead_id?: ID;
  budget?: string;
  actual_cost?: string;
  location_lat?: number;
  location_lng?: number;
  coverage_radius?: number;
  completion_percentage?: number;
  health_score?: number;
}

export interface MilestoneOut {
  id: ID;
  project_id: ID;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  due_date?: DateString;
  completed_date?: DateString;
  order_index?: number;
  progress?: number;
}

export interface MilestoneCreate {
  project_id: ID;
  name: string;
  description?: string;
  due_date?: DateString;
  order_index?: number;
}

export interface MilestoneUpdate {
  name?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
  due_date?: DateString;
  completed_date?: DateString;
  order_index?: number;
  progress?: number;
}

export interface ProjectBudgetSummary {
  project_id: ID;
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  percent_used: number;
  by_category: Record<string, number>; // e.g., { "labor": 5000, "materials": 2000 }
  status: ProjectStatus;
}

// --- Tasks & Workforce ---
export type TaskStatus = 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'cancelled';
export type AssignedRole = 'tech_lead' | 'project_manager' | 'technician' | 'customer_support';

export interface TaskOut {
  id: ID;
  project_id?: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  assigned_role?: AssignedRole;
  assigned_to_id?: ID;
  department_id?: ID;
  estimated_hours?: string; // Decimal string
  actual_hours?: string; // Decimal string
  scheduled_date?: DateString;
  dependencies?: ID[]; // Array of Task IDs this task depends on
  created_at: DateString;
  updated_at?: DateString;
}

export interface TaskCreate {
  project_id?: ID;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: ProjectPriority;
  assigned_role?: AssignedRole;
  assigned_to_id?: ID;
  department_id?: ID;
  estimated_hours?: string;
  scheduled_date?: DateString;
  dependencies?: ID[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: ProjectPriority;
  assigned_role?: AssignedRole;
  assigned_to_id?: ID;
  department_id?: ID;
  estimated_hours?: string;
  actual_hours?: string;
  scheduled_date?: DateString;
  dependencies?: ID[];
}

export interface TechnicianPerformance {
  technician_id: ID;
  tasks_assigned: number;
  tasks_completed: number;
  first_time_fixes: number;
  completion_rate: string; // Percentage string
  on_time_rate: string;
  avg_variance_pct: string;
  altitude_level: number; // Technician seniority level
}

// --- Inventory & Supply Chain ---
export interface Supplier {
  id: ID;
  name: string;
  website?: string;
  contact_email?: string;
  is_active: boolean;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ProductOut {
  id: ID;
  supplier_id: ID;
  name: string;
  sku?: string;
  category?: string;
  unit_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  low_inventory_threshold: number;
  is_empty_product: boolean; // Virtual product flag
  tr069_serial_number?: string;
  tr069_mac_address?: string;
  specifications?: Record<string, any>;
  image_url?: string; // Derived from BLOB endpoint
}

export interface ProductCreate {
  supplier_id: ID;
  name: string;
  sku?: string;
  category?: string;
  unit_price: number;
  quantity_in_stock: number;
  reorder_level?: number;
  low_inventory_threshold?: number;
  is_empty_product?: boolean;
  tr069_serial_number?: string;
  tr069_mac_address?: string;
  specifications?: Record<string, any>;
  image_url?: string;
}

export interface ProductUpdate {
  supplier_id?: ID;
  name?: string;
  sku?: string;
  category?: string;
  unit_price?: number;
  quantity_in_stock?: number;
  reorder_level?: number;
  low_inventory_threshold?: number;
  is_empty_product?: boolean;
  tr069_serial_number?: string;
  tr069_mac_address?: string;
  specifications?: Record<string, any>;
  image_url?: string;
}

export interface PurchaseOrderOut {
  id: ID;
  purchase_number: string;
  supplier_id: ID;
  total_amount: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received';
  items: PurchaseOrderItemOut[];
  created_at: DateString;
}

export interface PurchaseOrderCreate {
  supplier_id: ID;
  items: PurchaseOrderItemCreate[];
}

export interface PurchaseOrderUpdate {
  supplier_id?: ID;
  total_amount?: string;
  status?: 'draft' | 'pending' | 'approved' | 'ordered' | 'received';
  items?: PurchaseOrderItemUpdate[];
}

export interface PurchaseOrderItemOut {
  product_id: ID;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface PurchaseOrderItemCreate {
  product_id: ID;
  quantity: number;
  unit_price: string;
}

export interface PurchaseOrderItemUpdate {
  product_id?: ID;
  quantity?: number;
  unit_price?: string;
  total_price?: string;
}

// --- Finance & M-Pesa ---
export type MpesaTransactionType = 'PayBill' | 'BuyGoods' | 'B2C' | 'B2B';
export type MpesaTransactionStatus = 'Pending' | 'Completed' | 'Failed';

export interface MpesaTransactionOut {
  id: ID;
  transaction_type: MpesaTransactionType;
  mpesa_receipt_number?: string;
  transaction_date?: DateString;
  phone_number: string;
  amount: number;
  status: MpesaTransactionStatus;
  result_code?: number;
  result_desc?: string;
  reference?: string;
  description?: string;
  created_at: DateString;
  updated_at?: DateString;
}

export interface MpesaC2BRequest {
  phone_number: string;
  amount: number;
  bill_ref_number: string;
}

export interface MpesaSTKPushRequest {
  phone_number: string;
  amount: number;
  account_reference: string;
  description?: string;
}

export interface MpesaQRCodeRequest {
  amount: number;
  merchant_name: string;
  ref_no: string;
  trx_code?: string;
}

export interface MpesaB2CRequest {
  phone_number: string;
  amount: number;
  remarks: string;
  occasion?: string;
}

export interface MpesaB2BRequest {
  amount: number;
  receiver_shortcode: string;
  account_reference: string;
}

export interface MpesaTaxRemittanceRequest {
  amount: number;
  remarks: string;
}

export interface MpesaRatibaCreate {
  name: string;
  amount: number;
  phone_number: string;
  start_date: string;
  end_date: string;
  frequency: string;
}

export interface MpesaTransactionStatusRequest {
  checkout_request_id?: string;
  conversation_id?: string;
  originator_conversation_id?: string;
}

export interface MpesaReverseTransactionRequest {
  transaction_id: string;
  amount: number;
  remarks?: string;
  receiver_party?: string;
}

// Invoice types
export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled' | 'SENT';

export interface InvoiceOut {
  id: ID;
  invoice_number: string;
  project_id?: ID;
  customer_name?: string;
  issue_date: DateString;
  due_date: DateString;
  total_amount: number;
  amount_paid?: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItemOut[];
  created_at: DateString;
  updated_at: DateString;
}

export interface InvoiceCreate {
  project_id?: ID;
  customer_name?: string;
  issue_date: DateString;
  due_date: DateString;
  items: InvoiceItemCreate[];
}

export interface InvoiceUpdate {
  project_id?: ID;
  customer_name?: string;
  issue_date?: DateString;
  due_date?: DateString;
  total_amount?: number;
  amount_paid?: number;
  currency?: string;
  status?: InvoiceStatus;
  items?: InvoiceItemUpdate[];
}

export interface InvoiceItemOut {
  id: ID;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceItemCreate {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceItemUpdate {
  id?: ID;
  description?: string;
  quantity?: number;
  unit_price?: number;
}

// Financial Account types
export interface FinancialAccount {
  id: ID;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
}

export interface FinancialAccountCreate {
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active?: boolean;
}

export interface FinancialAccountUpdate {
  name?: string;
  type?: string;
  balance?: number;
  currency?: string;
  is_active?: boolean;
}

// Budget types
export type MasterBudgetStatus = 'active' | 'inactive' | 'completed';
export type SubBudgetType = string; // e.g., 'Operational', 'Marketing', 'Project'
export type BudgetUsageType = 'expense' | 'allocation' | 'adjustment';
export type BudgetUsageStatus = 'approved' | 'pending' | 'rejected';

export interface MasterBudgetOut {
  id: ID;
  name: string;
  start_date: DateString;
  end_date: DateString;
  total_amount: number;
  allocated_amount?: number;
  spent_amount?: number;
  remaining_amount?: number;
  status: MasterBudgetStatus;
  created_at: DateString;
  updated_at?: DateString;
}

export interface MasterBudgetCreate {
  name: string;
  start_date: DateString;
  end_date: DateString;
  total_amount: number;
}

export interface MasterBudgetUpdate {
  name?: string;
  start_date?: DateString;
  end_date?: DateString;
  total_amount?: number;
  status?: MasterBudgetStatus;
}

export interface SubBudgetOut {
  id: ID;
  master_budget_id: ID;
  name: SubBudgetType;
  category: string;
  allocated_amount: number;
  spent_amount?: number;
  remaining_amount?: number;
  status: MasterBudgetStatus; // Should be sub-budget status
  created_at: DateString;
  updated_at?: DateString;
}

export interface SubBudgetCreate {
  master_budget_id: ID;
  name: SubBudgetType;
  category: string;
  allocated_amount: number;
}

export interface SubBudgetUpdate {
  name?: SubBudgetType;
  category?: string;
  allocated_amount?: number;
  status?: MasterBudgetStatus;
}

export interface BudgetUsageOut {
  id: ID;
  sub_budget_id: ID;
  description: string;
  amount: number;
  type: BudgetUsageType;
  status: BudgetUsageStatus;
  transaction_date: DateString;
  approved_by_id?: ID;
  approved_at?: DateString;
  notes?: string;
  created_at: DateString;
  updated_at?: DateString;
}

export interface BudgetUsageCreate {
  sub_budget_id: ID;
  description: string;
  amount: number;
  type: BudgetUsageType;
  transaction_date: DateString;
}

export interface BudgetUsageUpdate {
  description?: string;
  amount?: number;
  type?: BudgetUsageType;
  status?: BudgetUsageStatus;
  transaction_date?: DateString;
  approved_by_id?: ID;
  approved_at?: DateString;
  notes?: string;
}

export interface FinancialSnapshotResponse {
  generated_at: DateString;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  active_projects: Record<string, any>;
  monthly_performance: {
    revenue: number;
    costs: number;
    profit: number;
  };
  receivables: {
    total_outstanding: number;
    overdue_count: number;
  };
  infrastructure_performance: Record<string, any>;
  top_infrastructure?: string;
}

export interface InfrastructureProfitabilityResponse {
  infrastructure_type: string;
  profit_margin: number;
  revenue: number;
  cost: number;
}

export interface ProfitabilityReportResponse {
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  net_profit: number;
  details: Record<string, any>[];
}

// NCBA Bank
export interface NcbaPayRequest {
  account_number: string;
  amount: number;
  currency?: string;
}

// BOM Variance types
export type BOMVarianceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BOMVarianceOut {
  id: ID;
  project_id: ID;
  task_id?: ID;
  item_name?: string; // e.g., "Fiber Optic Cable"
  variance_amount: number;
  reason?: string;
  status: BOMVarianceStatus;
  created_at: DateString;
  approved_by_id?: ID;
  approved_at?: DateString;
  notes?: string; // Approval notes
}

export interface BOMVarianceCreate {
  project_id: ID;
  task_id?: ID;
  item_name: string;
  variance_amount: number;
  reason?: string;
}

export interface BOMVarianceUpdate {
  item_name?: string;
  variance_amount?: number;
  reason?: string;
  status?: BOMVarianceStatus;
}

export interface BudgetTemplateDownloadLink {
  download_url: string;
}

export interface BudgetUploadResult {
  message: string;
  total_records: number;
  successful_uploads: number;
  failed_uploads: number;
  errors?: string[];
}

// --- HR & Payroll ---
export type EngagementType = 'FULL_TIME' | 'CONTRACT' | 'TASK_BASED' | 'SERVICE_BASED' | 'HYBRID';

export interface EmployeeProfileOut {
  id: ID;
  user_id: ID;
  employee_code: string;
  engagement_type: EngagementType;
  department?: string;
  designation?: string;
  hire_date: DateString;
  is_active: boolean;
  bank_name?: string;
  bank_account?: string;
  tax_id?: string;
}

export interface AttendanceRecordOut {
  id: ID;
  employee_id: ID;
  date: DateString;
  check_in?: DateString; // ISO timestamp
  check_out?: DateString;
  hours_worked: string;
  status: 'present' | 'absent' | 'leave';
  check_in_location?: string;
}

export interface PayoutOut {
  id: ID;
  employee_id: ID;
  gross_amount: string;
  net_amount: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  period_start: DateString;
  period_end: DateString;
}

// --- Workflow Engine (React Flow Compatible) ---
export interface WorkflowDefinitionOut {
  id: ID;
  name: string;
  model_name: string; // e.g., 'Project', 'PurchaseOrder'
  status: 'draft' | 'active';
  workflow_graph: {
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
    viewport?: { x: number; y: number; zoom: number };
  };
}

export interface ReactFlowNode {
  id: string;
  type: string; // 'input', 'default', 'output'
  position: { x: number; y: number };
  data: {
    label: string;
    required_role?: string;
    approval_type?: 'sequential' | 'parallel';
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface WorkflowInstanceOut {
  id: ID;
  workflow_id: ID;
  related_model: string;
  related_id: ID;
  current_stage_id?: ID;
  status: 'pending' | 'approved' | 'rejected';
  execution_path?: number[];
}

// --- CRM & Leads ---
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'unqualified';

export interface LeadOut {
  id: ID;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: 'website' | 'referral' | 'cold_call';
  status: LeadStatus;
  rating?: number;
  assigned_to_id?: ID;
  created_at: DateString;
}

export interface DealOut {
  id: ID;
  lead_id: ID;
  name: string;
  value: number;
  stage: 'prospecting' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  expected_close_date?: DateString;
}

// --- Audit Logs ---
export interface AuditLogOut {
  id: ID;
  user_id?: ID;
  user_email?: string;
  action: string; // e.g., 'create', 'delete', 'login'
  resource: string; // e.g., 'project', 'user'
  resource_id?: string;
  ip_address?: string;
  details?: Record<string, any>; // JSON diff or metadata
  created_at: DateString;
}