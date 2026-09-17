import { api } from '@/lib/api';

export interface DashboardKpis {
  openComplaints: number;
  overdueBills: number;
  todayVisitors: number;
  activeBookings: number;
}

type ReportFormat = 'pdf' | 'excel';

async function downloadReport(path: string, format: ReportFormat, filenameBase: string) {
  const response = await api.get(path, {
    params: { format },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filenameBase}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const reportsService = {
  dashboard: () => api.get<DashboardKpis>('/reports/dashboard').then((r) => r.data),

  downloadComplaintsReport: (format: ReportFormat) =>
    downloadReport('/reports/complaints', format, 'complaints-report'),

  downloadBillingReport: (format: ReportFormat) =>
    downloadReport('/reports/billing', format, 'billing-report'),

  downloadVisitorsReport: (format: ReportFormat) =>
    downloadReport('/reports/visitors', format, 'visitors-report'),
};
