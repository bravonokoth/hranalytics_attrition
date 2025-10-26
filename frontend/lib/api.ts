const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || 'An error occurred'
    );
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (userData: {
      name: string;
      email: string;
      password: string;
      department?: string;
      role?: string;
    }) =>
      fetchApi<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => fetchApi<any>('/auth/me'),
  },

  employees: {
    list: (params?: { search?: string; department?: string; attrition?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.attrition !== undefined) queryParams.append('attrition', String(params.attrition));

      const query = queryParams.toString();
      return fetchApi<any[]>(`/employees${query ? `?${query}` : ''}`);
    },
    get: (id: string) => fetchApi<any>(`/employees/${id}`),
    create: (data: any) =>
      fetchApi<any>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi<any>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/employees/${id}`, {
        method: 'DELETE',
      }),
  },

  analytics: {
    dashboard: () => fetchApi<{
      totalEmployees: number;
      attritionRate: number;
      averageAge: number;
      averageSalary: number;
      jobSatisfaction: number;
    }>('/analytics/dashboard'),
    byDepartment: () => fetchApi<any[]>('/analytics/department'),
    bySalary: () => fetchApi<any[]>('/analytics/salary'),
    byRole: () => fetchApi<any[]>('/analytics/role'),
  },

  prediction: {
    single: (employeeData: any) =>
      fetchApi<{
        prediction: 0 | 1;
        probability: number;
        riskLevel: 'Low' | 'Medium' | 'High';
      }>('/predict/single', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      }),
    batch: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Batch prediction failed');
        return res.json();
      });
    },
  },
};
