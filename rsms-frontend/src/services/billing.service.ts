import { api } from '@/lib/api';
import type { Bill, BillingConfig, BillStatus, PaginatedResult } from '@/types';
import type {
  ConfigureBillingFormValues,
  GenerateBillsFormValues,
  ProcessPaymentFormValues,
} from '@/schemas/billing.schema';

export const billingService = {
  getConfig: () =>
    api.get<BillingConfig[]>('/billing/config').then((r) => r.data),

  upsertConfig: (dto: ConfigureBillingFormValues) =>
    api.post<BillingConfig>('/billing/config', dto).then((r) => r.data),

  generate: (dto: GenerateBillsFormValues) =>
    api.post('/billing/generate', dto).then((r) => r.data),

  generateForResident: (residentId: string, dto: GenerateBillsFormValues) =>
    api.post(`/billing/bills/resident/${residentId}`, dto).then((r) => r.data),

  getAllBills: (params: { page?: number; limit?: number; status?: BillStatus }) =>
    api
      .get<PaginatedResult<Bill>>('/billing/bills', { params })
      .then((r) => r.data),

  getMyBills: () => api.get<Bill[]>('/billing/bills/my').then((r) => r.data),

  defaulters: () => api.get<Bill[]>('/billing/defaulters').then((r) => r.data),

  sendReminders: () => api.post('/billing/reminders').then((r) => r.data),

  dashboard: () =>
    api
      .get<{
        totalBilled: number;
        totalCollected: number;
        pendingCount: number;
        overdueCount: number;
      }>('/billing/dashboard')
      .then((r) => r.data),

  getBillById: (id: string) =>
    api.get<Bill>(`/billing/bills/${id}`).then((r) => r.data),

  pay: (id: string, dto: ProcessPaymentFormValues) =>
    api.post(`/billing/bills/${id}/pay`, dto).then((r) => r.data),

  downloadReceipt: async (id: string) => {
    const response = await api.get(`/billing/bills/${id}/receipt`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
