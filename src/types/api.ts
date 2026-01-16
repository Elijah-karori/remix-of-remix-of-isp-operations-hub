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
    technician_name: string;
    tasks_completed: number;
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
    employee_number: string;
    department?: string;
    position?: string;
    joining_date?: string;
    status: string;
    engagement_type: string;
    base_salary?: number;
    user?: UserOut;
}

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
    amount: number;
    currency: string;
    status: string;
    period_start: string;
    period_end: string;
    payout_date?: string;
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

export interface BudgetSummary {
    project_id: number;
    total_budget: number;
    allocated_amount: number;
    spent_amount: number;
    remaining_amount: number;
    variance: number;
}
