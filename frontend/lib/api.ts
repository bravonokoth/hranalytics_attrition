import type {
  User,
  AuthResponse,
  Employee,
  EmployeeCreate,
  DashboardStats,
  DepartmentAnalytics,
  SalaryAnalytics,
  RoleAnalytics,
  PredictionInput,
  PredictionResponse,
  BatchPredictionResponse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Enhanced error handling for 422 errors
      if (response.status === 422) {
        console.error('Validation error details:', data);
      }
      throw new ApiError(
        response.status,
        data?.detail || data?.message || data?.error || 'An error occurred',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

export const api = {
  // Authentication endpoints
  auth: {
    login: (email: string, password: string) =>
      fetchApi<AuthResponse>('/auth/login', {
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
      fetchApi<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    me: () => fetchApi<User>('/auth/me'),
  },

  // Employee endpoints
  employees: {
    list: (params?: { 
      search?: string; 
      department?: string; 
      attrition?: boolean;
      limit?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.attrition !== undefined) queryParams.append('attrition', String(params.attrition));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const query = queryParams.toString();
      // Fixed: Always use trailing slash
      return fetchApi<Employee[]>(`/employees/${query ? `?${query}` : ''}`);
    },
    
    get: (id: number | string) => 
      fetchApi<Employee>(`/employees/${id}`),
    
    create: (data: EmployeeCreate) => {
      // Log the data being sent for debugging
      console.log('Creating employee with data:', data);
      
      return fetchApi<Employee>('/employees/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: (id: number | string, data: Partial<Employee>) =>
      fetchApi<Employee>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number | string) =>
      fetchApi<{ message: string }>(`/employees/${id}`, {
        method: 'DELETE',
      }),
  },

  // Analytics endpoints
  analytics: {
    dashboard: () => 
      fetchApi<DashboardStats>('/analytics/dashboard'),
    
    byDepartment: () => 
      fetchApi<DepartmentAnalytics[]>('/analytics/department'),
    
    bySalary: () => 
      fetchApi<SalaryAnalytics[]>('/analytics/salary'),
    
    byRole: () => 
      fetchApi<RoleAnalytics[]>('/analytics/role'),
  },

  // Prediction endpoints
  prediction: {
    single: (employeeData: PredictionInput) =>
      fetchApi<PredictionResponse>('/predict/single', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      }),
    
    batch: async (file: File): Promise<BatchPredictionResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          error.detail || error.message || 'Batch prediction failed',
          error
        );
      }

      return response.json();
    },
    
    history: (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      return fetchApi<any[]>(`/predict/history${query}`);
    },
  },
};

// Utility function to handle API errors in components
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // For 422 errors, provide more detailed feedback
    if (error.status === 422 && error.details?.detail) {
      if (Array.isArray(error.details.detail)) {
        return error.details.detail.map((err: any) => 
          `${err.loc?.join('.')}: ${err.msg}`
        ).join(', ');
      }
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}