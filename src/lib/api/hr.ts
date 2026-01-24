import {
  EmployeeProfileResponse,
  RateCardResponse,
  RateCardCreate,
  PayoutResponse,
  ComplaintResponse,
  ComplaintCreate,
  TechnicianKPI,
  CustomerSatisfaction,
} from '../../types/api';
import { apiFetch } from './base';

export const hrApi = {
  // Employees
  employees: (params?: { engagement_type?: string; is_active?: boolean; skip?: number; limit?: number }): Promise<EmployeeProfileResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params?.engagement_type) searchParams.append("engagement_type", params.engagement_type);
    if (params?.is_active !== undefined) searchParams.append("is_active", String(params.is_active));
    if (params?.skip !== undefined) searchParams.append("skip", String(params.skip));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    return apiFetch<EmployeeProfileResponse[]>(`/api/v1/hr/employees?${searchParams}`);
  },

  employee: (id: number): Promise<EmployeeProfileResponse> =>
    apiFetch<EmployeeProfileResponse>(`/api/v1/hr/employees/${id}`),

  createEmployee: (data: any) =>
    apiFetch<EmployeeProfileResponse>("/api/v1/hr/employees", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  toggleEmployeeStatus: (userId: number) =>
    apiFetch(`/api/v1/hr/employees/${userId}/toggle-status`, { method: "PATCH" }),

  // Workflow Approvals
  approveWorkflow: (instanceId: number, comment?: string) =>
    apiFetch(`/api/v1/hr/workflow/${instanceId}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment })
    }),

  // Rate Cards
  rateCards: (employeeId: number, activeOnly = true) =>
    apiFetch<RateCardResponse[]>(`/api/v1/hr/rate-cards/${employeeId}?active_only=${activeOnly}`),

  createRateCard: (data: RateCardCreate) =>
    apiFetch<RateCardResponse>("/api/v1/hr/rate-cards", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Payouts
  calculatePayout: (data: { employee_id: number; period_start: string; period_end: string; task_id?: number; user_id?: number }) =>
    apiFetch<PayoutResponse>("/api/v1/hr/payouts/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  pendingPayouts: (limit = 50): Promise<PayoutResponse[]> =>
    apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/pending?limit=${limit}`),

  employeePayouts: (employeeId: number, limit = 10) =>
    apiFetch<PayoutResponse[]>(`/api/v1/hr/payouts/employee/${employeeId}?limit=${limit}`),

  approvePayout: (payoutId: number, data: { approved: boolean; notes?: string }) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/approve`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  markPayoutPaid: (payoutId: number, method: string, reference: string) =>
    apiFetch<PayoutResponse>(`/api/v1/hr/payouts/${payoutId}/mark-paid?payment_method=${encodeURIComponent(method)}&payment_reference=${encodeURIComponent(reference)}`, {
      method: "POST"
    }),

  // Complaints
  recordComplaint: (data: ComplaintCreate) =>
    apiFetch<ComplaintResponse>("/api/v1/hr/complaints", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  listComplaints: (employeeId?: number) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints${employeeId ? `?employee_id=${employeeId}` : ''}`),

  pendingComplaints: (limit = 50) =>
    apiFetch<ComplaintResponse[]>(`/api/v1/hr/complaints/pending?limit=${limit}`),

  investigateComplaint: (complaintId: number, isValid: boolean, notes: string, resolution?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.append("is_valid", String(isValid));
    searchParams.append("investigation_notes", notes);
    if (resolution) searchParams.append("resolution", resolution);
    return apiFetch<ComplaintResponse>(`/api/v1/hr/complaints/${complaintId}/investigate?${searchParams}`, {
      method: "POST"
    });
  },

  // Attendance
  recordAttendance: (data: any) =>
    apiFetch("/api/v1/hr/attendance", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getAttendance: (employeeId: number, startDate: string, endDate: string) =>
    apiFetch<any[]>(`/api/v1/hr/attendance/${employeeId}?start_date=${startDate}&end_date=${endDate}`),

  // Reports
  payrollSummary: (periodStart: string, periodEnd: string) =>
    apiFetch(`/api/v1/hr/reports/payroll-summary?period_start=${periodStart}&period_end=${periodEnd}`),

  employeePerformance: (employeeId: number, periodStart: string, periodEnd: string) =>
    apiFetch(`/api/v1/hr/reports/employee-performance/${employeeId}?period_start=${periodStart}&period_end=${periodEnd}`),
};

export const techniciansApi = {
    performance: (technicianId: number, periodStart?: string, periodEnd?: string) => {
      const params = new URLSearchParams();
      if (periodStart) params.append("period_start", periodStart);
      if (periodEnd) params.append("period_end", periodEnd);
      return apiFetch<TechnicianKPI>(`/api/v1/technicians/${technicianId}/performance?${params}`);
    },

    leaderboard: (periodStart?: string, periodEnd?: string, limit = 10) => {
      const params = new URLSearchParams();
      if (periodStart) params.append("period_start", periodStart);
      if (periodEnd) params.append("period_end", periodEnd);
      params.append("limit", String(limit));
      return apiFetch<TechnicianKPI[]>(`/api/v1/technicians/leaderboard?${params}`);
    },

    altitude: (technicianId: number) =>
      apiFetch(`/api/v1/technicians/${technicianId}/altitude`),

    // Customer Satisfaction
    recordSatisfaction: (data: { task_id: number; rating: number; feedback?: string }) =>
      apiFetch<CustomerSatisfaction>("/api/v1/technicians/satisfaction", {
        method: "POST",
        body: JSON.stringify(data)
      }),

    listSatisfaction: (params?: { technician_id?: number; task_id?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.technician_id) searchParams.append("technician_id", String(params.technician_id));
      if (params?.task_id) searchParams.append("task_id", String(params.task_id));
      if (params?.limit) searchParams.append("limit", String(params.limit));
      return apiFetch<CustomerSatisfaction[]>(`/api/v1/technicians/satisfaction?${searchParams}`);
    },
  };
