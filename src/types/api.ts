export interface Token {
    access_token: string;
    token_type: string;
}

export interface HTTPValidationError {
    detail: ValidationError[];
}

export interface ValidationError {
    loc: string[];
    msg: string;
    type: string;
}

// --- Auth & Users ---

export interface UserOut {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
    role_id?: number;
    department_id?: number;
    phone_number?: string;
    avatar_url?: string;
    role?: RoleV2Out;
    department?: DepartmentOut;
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

export interface RoleV2Out {
    id: number;
    name: string;
    description?: string;
    parent_id?: number;
    scopes: string[];
}

export interface DepartmentOut {
    id: number;
    name: string;
    description?: string;
    division_id?: number;
}

// --- Projects ---

export interface ProjectOut {
    id: number;
    name: string;
    description?: string;
    status: string; // ProjectStatus enum ideally
    department_id?: number;
    division_id?: number;
    manager_id?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    infrastructure_type?: string;
    location_lat?: number;
    location_lng?: number;
    coverage_radius?: number;
    completion_percentage?: number;
    health_score?: number;
}

export interface ProjectCreate {
    name: string;
    description?: string;
    department_id?: number;
    division_id?: number;
    manager_id?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    infrastructure_type?: string;
    location_lat?: number;
    location_lng?: number;
    coverage_radius?: number;
}

export interface ProjectUpdate {
    name?: string;
    description?: string;
    status?: string;
    department_id?: number;
    division_id?: number;
    manager_id?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    infrastructure_type?: string;
    location_lat?: number;
    location_lng?: number;
    coverage_radius?: number;
}

export interface MilestoneOut {
    id: number;
    project_id: number;
    name: string;
    description?: string;
    due_date?: string;
    status: string;
    progress: number;
}

// --- Tasks ---

export interface TaskOut {
    id: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    project_id: number;
    assigned_to_id?: number;
    assigned_role_id?: number;
    department_id?: number;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    completion_percentage: number;
    parent_task_id?: number;
    created_at: string;
    updated_at: string;
    assignee?: UserOut;
    project?: ProjectOut;
}

export interface TaskCreate {
    title: string;
    description?: string;
    project_id: number;
    assigned_to_id?: number;
    assigned_role_id?: number;
    department_id?: number;
    status?: string;
    priority?: string;
    due_date?: string;
    estimated_hours?: number;
    parent_task_id?: number;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    assigned_to_id?: number;
    assigned_role_id?: number;
    status?: string;
    priority?: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    completion_percentage?: number;
}

// --- Inventory ---

export interface Product {
    id: number;
    name: string;
    sku: string;
    description?: string;
    category?: string;
    price: number;
    cost_price?: number;
    quantity_on_hand: number;
    reorder_level?: number;
    supplier_id?: number;
    image_url?: string;
    specifications?: Record<string, any>;
    is_active: boolean;
    supplier?: Supplier;
}

export interface ProductCreate {
    name: string;
    sku?: string;
    description?: string;
    category?: string;
    price: number;
    cost_price?: number;
    quantity_on_hand?: number;
    reorder_level?: number;
    supplier_id?: number;
    specifications?: Record<string, any>;
}

export interface Supplier {
    id: number;
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active: boolean;
}

export interface StockMovement {
    id: number;
    product_id: number;
    movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reference?: string;
    notes?: string;
    created_at: string;
    created_by_id?: number;
}


// --- Technicians ---

export interface TechnicianKPI {
    technician_id: number;
    tasks_completed: number;
    completed_tasks: number; // Some endpoints might use this
    avg_resolution_time: number;
    weighted_score: number;
    average_rating: number;
    on_time_rate: number;
    efficiency_score: number;
}

export interface CustomerSatisfaction {
    id: number;
    task_id: number;
    technician_id: number;
    rating: number;
    feedback?: string;
    created_at: string;
}

// --- HR ---

export interface EmployeeProfileResponse {
    id: number;
    user_id: number;
    employee_code: string;
    engagement_type: string;
    department?: string | null;
    designation?: string | null;
    hire_date: string;
    contract_end_date?: string | null;
    termination_date?: string | null;
    is_active: boolean;
    user?: UserOut;
}

export type EngagementType = 'FULL_TIME' | 'CONTRACT' | 'TASK_BASED' | 'SERVICE_BASED' | 'HYBRID';

export interface AttendanceRecordResponse {
    id: number;
    employee_id: number;
    date: string;
    clock_in?: string;
    clock_out?: string;
    status: string;
    total_hours?: number;
}

export interface PayoutResponse {
    id: number;
    employee_id: number;
    gross_amount: string | number;
    net_amount: string | number;
    status: string;
    period_start: string;
    period_end: string;
    approved_by?: number | null;
    payment_method?: string | null;
    payment_reference?: string | null;
    paid_at?: string | null;
    employee?: EmployeeProfileResponse;
}


export interface RateCardResponse {
    id: number;
    employee_id: number;
    role: string;
    hourly_rate: number;
    currency: string;
    is_active: boolean;
}

export interface RateCardCreate {
    employee_id: number;
    role: string;
    hourly_rate: number;
    currency?: string;
}

export interface ComplaintResponse {
    id: number;
    complainant_name: string;
    subject: string;
    description: string;
    status: string;
    resolution?: string;
    created_at: string;
}

export interface ComplaintCreate {
    subject: string;
    description: string;
    complainant_name?: string;
    complainant_contact?: string;
    employee_id?: number;
}

// --- Workflow ---


export interface WorkflowDefinitionRead {
    id: number;
    name: string;
    description?: string;
    trigger_type: string;
    is_active: boolean;
    created_at: string;
    steps: WorkflowStep[];
}

export interface WorkflowStep {
    id: string; // usually UUID
    type: string;
    name: string;
    next_steps: string[];
}

export interface WorkflowInstanceRead {
    id: number;
    workflow_id: number;
    current_step_id: string;
    status: string; // PENDING, APPROVED, REJECTED
    context_data?: Record<string, any>;
    created_at: string;
    workflow?: WorkflowDefinitionRead;
}


export interface WorkflowGraphCreate {
    name: string;
    description?: string;
    trigger_type: string;
    steps: WorkflowStep[];
    edges?: any[]; // Simplified for now
}

// --- Finance ---

export interface BOMVarianceOut {
    id: number;
    project_id: number;
    task_id: number;
    variance_amount: number;
    reason?: string;
    status: string; // PENDING, APPROVED, REJECTED
    created_at: string;
}

export interface ProjectFinancialsOut {
    project_id: number;
    total_budget: number;
    total_cost: number;
    gross_profit: number;
    profit_margin: number;
}

export interface ProfitabilityReportResponse {
    total_revenue: number;
    total_cost: number;
    gross_profit: number;
    net_profit: number;
    details: Record<string, any>[];
}

export interface InfrastructureProfitabilityResponse {
    infrastructure_type: string;
    profit_margin: number;
    revenue: number;
    cost: number;
}

export interface FinancialAccount {
    id: number;
    name: string;
    type: string;
    balance: number;
    currency: string;
    is_active: boolean;
}

export interface FinancialAccountCreate { // New interface
    name: string;
    type: string;
    balance: number;
    currency: string;
    is_active?: boolean;
}

export interface FinancialAccountUpdate { // New interface
    name?: string;
    type?: string;
    balance?: number;
    currency?: string;
    is_active?: boolean;
}

export interface BudgetSummary {
    project_id: number;
    total_budget: number;
    allocated_amount: number;
    spent_amount: number;
    remaining_amount: number;
    variance: number;
}

// --- Scrapers ---

export interface ScraperRun {
    supplier_id: number;
    id: number;
    status: string;
    products_scraped: number;
    products_updated?: number;
    products_added?: number;
    error_message?: string | null;
    execution_time?: number | null;
    started_at: string;
    completed_at?: string | null;
}

export interface PriceHistory {
    id: number;
    product_id: number;
    old_price: number;
    new_price: number;
    price_change: number;
    price_change_percent: number;
    recorded_at: string;
}

// --- Permissions & Roles (RBAC) ---

export interface PermissionV2Out {
    id: number;
    name: string;
    codename: string;
    content_type_id?: number;
}

export type RoleStatus = 'active' | 'inactive' | 'archived';

export interface HierarchyLevel {
    level: number;
    name: string;
}

export interface RoleHierarchyOut {
    role: RoleV2Out;
    children: RoleHierarchyOut[];
    parent_role_id?: number | null;
    depth: number;
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

export interface IndependentRoleOut {
    name: string;
    id: number;
    description?: string | null;
    level: number;
    scope_level: string | null;
    status: RoleStatus;
    is_system_role: boolean;
    created_at: string;
    permissions: PermissionV2Out[];
    is_independent: boolean;
    floating_scope: string;
    implementation_logic?: string | null;
}

export interface FuzzyMatchResult {
    target_role_name: string;
    suggested_parent_id?: number | null;
    suggested_parent_name?: string | null;
    suggested_level: HierarchyLevel;
    confidence: number;
    reason: string;
}

export interface AccessPolicyOut {
    id: number;
    name: string;
    description?: string | null;
    resource: string;
    action: string;
    required_roles?: string[] | null;
    required_permissions?: string[] | null;
    conditions?: Record<string, any> | null;
    target_hierarchy_level?: HierarchyLevel | null;
    start_time?: string | null;
    end_time?: string | null;
    active_days?: string[] | null;
    priority: number;
    is_active: boolean;
    created_by?: number | null;
    created_at: string;
}

export interface FeaturePolicyRequest {
    feature_name: string;
    resources: string[];
    actions: string[];
    conditions?: Record<string, any> | null;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserStatusUpdateRequest {
    status: UserStatus;
    reason?: string | null;
}

// --- Finance Extensions ---

export interface MpesaTransactionOut {
    id: number;
    transaction_type: string;
    mpesa_receipt_number?: string | null;
    transaction_date?: string | null;
    phone_number: string;
    amount: number;
    status: string;
    result_desc?: string | null;
    result_code?: number | null;
    reference?: string | null;
    description?: string | null;
    created_at: string;
    updated_at?: string | null;
}

export type BudgetUsageType = 'expense' | 'allocation' | 'adjustment';
export type BudgetUsageStatus = 'approved' | 'pending' | 'rejected';
export type SubBudgetType = string; // Using string as default if enum is not strictly defined yet

export interface MasterBudget {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    total_amount: string | number;
    created_at: string;
    updated_at?: string | null;
    sub_budgets: SubBudget[];
}

export interface MasterBudgetCreate { // New interface
    name: string;
    start_date: string;
    end_date: string;
    total_amount: number; // Use number for creation
}

export interface MasterBudgetUpdate { // New interface
    name?: string;
    start_date?: string;
    end_date?: string;
    total_amount?: number;
}

export interface SubBudget {
    id: number;
    name: SubBudgetType;
    amount: string | number;
    financial_account_id?: number | null;
    master_budget_id: number;
    usages: BudgetUsage[];
}

export interface SubBudgetCreate { // New interface
    name: SubBudgetType;
    amount: number;
    financial_account_id?: number;
    master_budget_id: number;
}

export interface SubBudgetUpdate { // New interface
    name?: SubBudgetType;
    amount?: number;
    financial_account_id?: number;
}

export interface BudgetUsage {
    id: number;
    sub_budget_id: number;
    description?: string | null;
    amount: string | number;
    type: BudgetUsageType;
    transaction_date: string;
    status: BudgetUsageStatus | null;
    created_at: string;
    updated_at?: string | null;
}

export interface BudgetUsageCreate { // New interface
    sub_budget_id: number;
    description?: string;
    amount: number;
    type: BudgetUsageType;
    transaction_date: string;
}

export interface BudgetUsageUpdate { // New interface
    description?: string;
    amount?: number;
    type?: BudgetUsageType;
    transaction_date?: string;
    status?: BudgetUsageStatus;
}

export interface Invoice { // New interface
    id: number;
    invoice_number: string;
    customer_id?: number;
    customer_name?: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    currency: string;
    status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
    items: InvoiceItem[];
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem { // New interface
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface InvoiceCreate { // New interface
    customer_id?: number;
    customer_name?: string;
    issue_date: string;
    due_date: string;
    items: InvoiceItemCreate[];
}

export interface InvoiceItemCreate { // New interface
    description: string;
    quantity: number;
    unit_price: number;
}

export interface InvoiceUpdate { // New interface
    customer_id?: number;
    customer_name?: string;
    issue_date?: string;
    due_date?: string;
    total_amount?: number;
    status?: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
    items?: InvoiceItemUpdate[];
}

export interface InvoiceItemUpdate { // New interface
    id?: number; // Optional for existing items
    description?: string;
    quantity?: number;
    unit_price?: number;
    total?: number;
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
    transaction_id: string;
}

export interface MpesaReverseTransactionRequest {
    transaction_id: string;
    amount: number;
    remarks?: string;
    receiver_party?: string;
}

// NCBA Bank
export interface NcbaPayRequest {
    account_number: string;
    amount: number;
    currency?: string;
}

export interface FinancialSnapshotResponse {
    generated_at: string;
    active_projects: Record<string, any>;
    monthly_performance: Record<string, any>;
    receivables: Record<string, any>;
    infrastructure_performance: Record<string, any>;
    top_infrastructure?: string | null;
}

// --- CRM ---

export interface Lead {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
    source?: string;
    created_at: string;
    updated_at: string;
    owner_id?: number; // UserOut.id
    description?: string;
}

export interface LeadCreate {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    status?: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
    source?: string;
    description?: string;
    owner_id?: number;
}

export interface LeadUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: 'New' | 'Contacted' | 'Qualified' | 'Unqualified';
    source?: string;
    description?: string;
    owner_id?: number;
}

export interface Deal {
    id: number;
    name: string;
    amount: number;
    stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    close_date?: string; // Date string
    created_at: string;
    updated_at: string;
    lead_id?: number;
    owner_id?: number; // UserOut.id
    description?: string;
}

export interface DealCreate {
    name: string;
    amount: number;
    stage?: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    close_date?: string;
    lead_id?: number;
    owner_id?: number;
    description?: string;
}

export interface DealUpdate {
    name?: string;
    amount?: number;
    stage?: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    close_date?: string;
    lead_id?: number;
    owner_id?: number;
    description?: string;
}

export interface Activity {
    id: number;
    activity_type: 'Call' | 'Meeting' | 'Email' | 'Task';
    due_date?: string; // Date string
    status: 'Pending' | 'Completed' | 'Cancelled';
    notes?: string;
    created_at: string;
    updated_at: string;
    lead_id?: number;
    deal_id?: number;
    assigned_to_id?: number; // UserOut.id
}

export interface ActivityCreate {
    activity_type: 'Call' | 'Meeting' | 'Email' | 'Task';
    due_date?: string;
    status?: 'Pending' | 'Completed' | 'Cancelled';
    notes?: string;
    lead_id?: number;
    deal_id?: number;
    assigned_to_id?: number;
}

export interface ActivityUpdate { // New interface
    activity_type?: 'Call' | 'Meeting' | 'Email' | 'Task';
    due_date?: string;
    status?: 'Pending' | 'Completed' | 'Cancelled';
    notes?: string;
    lead_id?: number;
    deal_id?: number;
    assigned_to_id?: number;
}
