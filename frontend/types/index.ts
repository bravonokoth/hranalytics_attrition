// User types
export interface User {
  id: number;
  name: string;
  email: string;
  department?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Employee types
export interface Employee {
  id: number;
  age: number;
  business_travel?: string;
  daily_rate?: number;
  department?: string;
  distance_from_home?: number;
  education?: number;
  education_field?: string;
  employee_count: number;
  employee_number?: number;
  environment_satisfaction?: number;
  gender?: string;
  hourly_rate?: number;
  job_involvement?: number;
  job_level?: number;
  job_role?: string;
  job_satisfaction?: number;
  marital_status?: string;
  monthly_income?: number;
  monthly_rate?: number;
  num_companies_worked?: number;
  over_18?: string;
  over_time?: string;
  percent_salary_hike?: number;
  performance_rating?: number;
  relationship_satisfaction?: number;
  standard_hours?: number;
  stock_option_level?: number;
  total_working_years?: number;
  training_times_last_year?: number;
  work_life_balance?: number;
  years_at_company?: number;
  years_in_current_role?: number;
  years_since_last_promotion?: number;
  years_with_curr_manager?: number;
  attrition?: string;
}

export interface EmployeeCreate {
  age: number;
  business_travel?: string;
  department?: string;
  job_role?: string;
  monthly_income?: number;
  // ... add other fields as needed
}

// Analytics types
export interface DashboardStats {
  totalEmployees: number;
  attritionRate: number;
  averageAge: number;
  averageSalary: number;
  jobSatisfaction: number;
}

export interface DepartmentAnalytics {
  department: string;
  total: number;
  attrition: number;
  attritionRate: number;
}

export interface SalaryAnalytics {
  range: string;
  total: number;
  attrition: number;
  attritionRate: number;
}

export interface RoleAnalytics {
  role: string;
  total: number;
  attrition: number;
  attritionRate: number;
}

// Prediction types
export interface PredictionInput {
  age: number;
  business_travel: string;
  department: string;
  distance_from_home: number;
  education: number;
  education_field: string;
  environment_satisfaction: number;
  gender: string;
  job_involvement: number;
  job_level: number;
  job_role: string;
  job_satisfaction: number;
  marital_status: string;
  monthly_income: number;
  num_companies_worked: number;
  over_time: string;
  relationship_satisfaction: number;
  stock_option_level: number;
  total_working_years: number;
  training_times_last_year: number;
  work_life_balance: number;
  years_at_company: number;
  years_in_current_role: number;
  years_since_last_promotion: number;
  years_with_curr_manager: number;
}

export interface PredictionResponse {
  prediction: 0 | 1;
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface BatchPredictionResponse {
  total: number;
  predictions: Array<PredictionInput & PredictionResponse>;
}