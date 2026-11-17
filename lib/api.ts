export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include', // session cookie
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || 'Something went wrong', response.status, data);
  return data as T;
}

const moneyHeaders = (key?: string, pin?: string): Record<string, string> => ({
  ...(key ? { 'Idempotency-Key': key } : {}),
  ...(pin ? { 'X-Transaction-Pin': pin } : {}),
});

export const api = {
  users: {
    list: (q?: string) =>
      apiRequest<{ users: UserDto[] }>(`/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    pending: () => apiRequest<{ users: PendingUserDto[] }>('/users/pending'),
    create: (data: Record<string, unknown>) =>
      apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string) => apiRequest(`/users/${id}/approve`, { method: 'PATCH' }),
    reject: (id: string) => apiRequest(`/users/${id}/reject`, { method: 'PATCH' }),
    suspend: (id: string) => apiRequest(`/users/${id}/suspend`, { method: 'PATCH' }),
    resetPin: (id: string) => apiRequest(`/users/${id}/reset-pin`, { method: 'POST' }),
    setRole: (id: string, role: string) =>
      apiRequest(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    unverified: () => apiRequest<{ users: PendingUserDto[] }>('/users/unverified'),
    verifyEmail: (id: string) => apiRequest(`/users/${id}/verify-email`, { method: 'PATCH' }),
  },

  me: {
    update: (data: { full_name?: string; phone?: string; emailNotifications?: boolean }) =>
      apiRequest<{ user: UserDto }>('/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  wallet: {
    balance: () =>
      apiRequest<{ balance: number; currency: string; transactions: LedgerEntry[] }>('/wallet/balance'),
    fund: (amount: number) =>
      apiRequest<{ authorizationUrl: string; reference: string }>('/wallet/fund', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
    transactions: () => apiRequest<{ transactions: TransactionDto[] }>('/wallet/transactions'),
  },

  plans: {
    getAll: (params?: { provider?: string; type?: string }) => {
      const qs = params
        ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][])}`
        : '';
      return apiRequest<{ plans: PlanDto[] }>(`/plans${qs}`);
    },
    getAdminAll: () => apiRequest<{ plans: PlanDto[] }>('/plans/all'),
    create: (data: Record<string, unknown>) =>
      apiRequest('/plans', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => apiRequest(`/plans/${id}`, { method: 'DELETE' }),
  },

  orders: {
    purchase: (
      data: { planId: string; phoneNumber: string; amount?: number },
      idempotencyKey?: string,
      pin?: string
    ) =>
      apiRequest<OrderResponse>('/orders/purchase', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: moneyHeaders(idempotencyKey, pin),
      }),
    airtime: (
      data: { provider: string; phoneNumber: string; amount: number },
      idempotencyKey?: string,
      pin?: string
    ) =>
      apiRequest<OrderResponse>('/orders/airtime', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: moneyHeaders(idempotencyKey, pin),
      }),
    mine: () => apiRequest<{ orders: OrderDto[] }>('/orders/mine'),
    get: (id: string) => apiRequest<{ order: OrderDto; ledger: LedgerLine[] }>(`/orders/${id}`),
    all: (params?: { status?: string; needsReview?: boolean }) => {
      const sp = new URLSearchParams();
      if (params?.status) sp.set('status', params.status);
      if (params?.needsReview) sp.set('needsReview', 'true');
      const s = sp.toString();
      return apiRequest<{ orders: OrderDto[] }>(`/orders${s ? `?${s}` : ''}`);
    },
    updateStatus: (id: string, data: { status: 'success' | 'failed'; message?: string }) =>
      apiRequest<{ order: OrderDto; refunded: boolean }>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  security: {
    pinStatus: () => apiRequest<{ hasPin: boolean; lockedUntil?: string }>('/security/pin'),
    setPin: (data: { pin: string; currentPin?: string }) =>
      apiRequest('/security/pin', { method: 'POST', body: JSON.stringify(data) }),
  },

  notifications: {
    list: (p?: { page?: number; unread?: boolean }) =>
      apiRequest<{
        notifications: NotificationDto[];
        total: number;
        page: number;
        pages: number;
        unreadCount: number;
      }>(`/notifications?page=${p?.page ?? 1}${p?.unread ? '&unread=true' : ''}`),
    markRead: (data: { ids?: string[]; all?: boolean }) =>
      apiRequest('/notifications/read', { method: 'POST', body: JSON.stringify(data) }),
  },

  referrals: {
    me: () => apiRequest<ReferralSummary>('/referrals/me'),
    claim: (code: string) =>
      apiRequest('/referrals/claim', { method: 'POST', body: JSON.stringify({ code }) }),
  },

  tickets: {
    getAll: (status?: string) =>
      apiRequest<{ tickets: TicketDto[] }>(`/tickets${status && status !== 'all' ? `?status=${status}` : ''}`),
    create: (data: Record<string, unknown>) =>
      apiRequest('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      apiRequest(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    stats: () =>
      apiRequest<{ open: number; inProgress: number; resolved: number; closed: number }>('/tickets/stats'),
  },

  reports: {
    summary: (from: string, to: string) =>
      apiRequest<ReportSummary>(`/admin/reports/summary?from=${from}&to=${to}`),
    timeseries: (from: string, to: string) =>
      apiRequest<{ days: ReportDay[] }>(`/admin/reports/timeseries?from=${from}&to=${to}`),
    breakdown: (from: string, to: string) =>
      apiRequest<ReportBreakdown>(`/admin/reports/breakdown?from=${from}&to=${to}`),
    reconciliation: () => apiRequest<Reconciliation>('/admin/reports/reconciliation'),
  },
  ops: {
    userOverview: (id: string) => apiRequest<UserOverview>(`/admin/ops/users/${id}/overview`),
    ledger: (p: { page?: number; userId?: string; kind?: string; type?: string; q?: string }) => {
      const sp = new URLSearchParams();
      Object.entries(p).forEach(([k, v]) => v && sp.set(k, String(v)));
      return apiRequest<{ entries: AdminLedgerRow[]; total: number; page: number; pages: number }>(`/admin/ops/ledger?${sp}`);
    },
    audit: (p: { page?: number; action?: string }) => {
      const sp = new URLSearchParams();
      Object.entries(p).forEach(([k, v]) => v && sp.set(k, String(v)));
      return apiRequest<{ rows: AuditRow[]; total: number; page: number; pages: number }>(`/admin/ops/audit?${sp}`);
    },
  },
  adminWallets: {
    adjust: (userId: string, data: { type: 'credit' | 'debit'; amount: number; reason: string }) =>
      apiRequest<{ success: boolean; balance: number }>(`/admin/wallets/${userId}/adjust`, { method: 'POST', body: JSON.stringify(data) }),
    lock: (userId: string, locked: boolean) =>
      apiRequest<{ isLocked: boolean }>(`/admin/wallets/${userId}/lock`, { method: 'PATCH', body: JSON.stringify({ locked }) }),
  },

  admin: {
    dashboard: () => apiRequest('/admin/dashboard'),
    settings: () => apiRequest<{ settings: SettingsDto }>('/admin/settings'),
    updateSettings: (data: Record<string, unknown>) =>
      apiRequest('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    trafficMetrics: () => apiRequest('/admin/traffic/metrics'),
    trafficTest: (data: Record<string, unknown>) =>
      apiRequest('/admin/traffic/test', { method: 'POST', body: JSON.stringify(data) }),
  },

  vtu: {
    status: () => apiRequest<VtuStatusDto>('/admin/vtu/status'),
    sync: (markupPercent: number) =>
      apiRequest<{ created: number; updated: number; deactivated: number; skippedDuplicates: number }>(
        '/admin/vtu/sync',
        { method: 'POST', body: JSON.stringify({ markupPercent }) }
      ),
    requery: (orderId: string) =>
      apiRequest<{ providerStatus: string; message: string; notFound: boolean; outcome: string }>(
        `/admin/vtu/requery/${orderId}`,
        { method: 'POST' }
      ),
  },

  payments: {
    verify: (reference: string) =>
      apiRequest<{ status: string; result: string; credited: boolean }>(
        `/payments/verify/${encodeURIComponent(reference)}`
      ),
  },

  contact: {
    send: (data: Record<string, unknown>) =>
      apiRequest('/contact', { method: 'POST', body: JSON.stringify(data) }),
  },
};

/* ------------------------------- Types ------------------------------- */

export type UserDto = {
  id?: string;
  _id?: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'superadmin';
  phone?: string;
  avatar?: string;
  isApproved?: boolean;
  isEmailVerified?: boolean;
  isSuspended?: boolean;
  twoFactorEnabled?: boolean;
  hasPin?: boolean;
  emailNotifications?: boolean;
  createdAt?: string;
};

export type PendingUserDto = UserDto & { approvalToken?: string };

export type PlanDto = {
  _id: string;
  name: string;
  provider: 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';
  type: 'data' | 'airtime';
  dataSize: string;
  duration: number;
  durationUnit: string;
  price: number;
  costPrice?: number; // staff-only; never returned to customers
  planCode?: string;
  isActive: boolean;
  features?: string[];
};

export type OrderDto = {
  _id: string;
  type: string;
  provider: string;
  phoneNumber: string;
  amount: number;
  dataSize?: string;
  planId?: string;
  planName?: string;
  status: string;
  reference: string;
  providerMessage?: string;
  needsReview?: boolean;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
  userId?: UserDto | string;
};

export type OrderResponse = {
  success: boolean;
  pending: boolean;
  replay: boolean;
  message: string;
  order: OrderDto;
};

export type LedgerLine = {
  type: 'credit' | 'debit';
  kind: string;
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string;
  createdAt: string;
};

export type NotificationDto = {
  _id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
};

export type ReferralSummary = {
  enabled: boolean;
  rewardNaira: number;
  minPurchaseNaira: number;
  code: string;
  stats: { total: number; rewarded: number; pending: number; earned: number };
  referrals: { id: string; name: string; status: 'pending' | 'rewarded' | 'void'; createdAt: string }[];
};

export type VtuStatusDto = {
  mode: 'mock' | 'live';
  provider: string;
  environment: 'sandbox' | 'live';
  configured: boolean;
  webhookConfigured: boolean;
  balance: number | null;
  balanceError: string | null;
  lowBalanceThreshold: number;
  plansBelowCost: number;
  needsReview: number;
  processing: number;
  inactiveSynced: number;
  isProduction: boolean;
};

export type TicketDto = {
  _id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  responses: Array<{ message: string; isAdmin: boolean; createdAt: string }>;
  userId?: UserDto | string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionDto = {
  _id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  paymentMethod: string;
  createdAt: string;
};

export type LedgerEntry = {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
};

export type SettingsDto = {
  maintenanceMode: boolean;
  vtuMode: 'mock' | 'live';
  fundingFeePercent: number;
  minWalletFund: number;
  maxWalletFund: number;
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  referralEnabled: boolean;
  referralRewardNaira: number;
  referralMinPurchaseNaira: number;
  referralMaxPerReferrer: number;
  airtimeCostPercent: number;
};

export type ReportSummary = {
  range: { from: string; to: string };
  orders: { total: number; delivered: number; failed: number; open: number };
  successRate: number;
  revenue: number;
  cost: number;
  profit: number;
  profitCoverage: number;
  fundedNaira: number;
  refundedNaira: number;
  referralPaidNaira: number;
  adjustmentsNetNaira: number;
  walletLiabilityNaira: number;
  newUsers: number;
};

export type ReportDay = { day: string; orders: number; delivered: number; failed: number; revenue: number; profit: number };

export type ReportBreakdown = {
  byNetwork: { provider: string; type: string; orders: number; revenue: number; profit: number }[];
  topPlans: { provider: string; dataSize: string; orders: number; revenue: number; profit: number }[];
};

export type Reconciliation = {
  balanced: boolean;
  ledgerNetNaira: number;
  walletTotalNaira: number;
  differenceNaira: number;
  drift: { userId: string; email: string; ledgerNaira: number; walletNaira: number }[];
  stuckOrders: number;
  needsReview: number;
  pendingFunding: number;
  checkedAt: string;
};

export type AdminLedgerRow = LedgerLine & { userId: string; email: string };

export type AuditRow = {
  _id: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  summary: string;
  ip?: string;
  createdAt: string;
};

export type UserOverview = {
  user: UserDto;
  wallet: { balance: number; isLocked: boolean };
  orderStats: { status: string; count: number; amount: number }[];
  ledger: LedgerLine[];
  orders: OrderDto[];
  referredBy: { status: string; code: string } | null;
  referralsMade: number;
};