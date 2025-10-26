'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart3, TrendingDown, Building2, Briefcase } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [deptData, salData, roleData] = await Promise.all([
        api.analytics.byDepartment(),
        api.analytics.bySalary(),
        api.analytics.byRole(),
      ]);

      setDepartmentData(deptData);
      setSalaryData(salData);
      setRoleData(roleData);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Visual insights into your workforce data</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <CardTitle>Attrition by Department</CardTitle>
              </div>
              <CardDescription>
                Compare employee turnover across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis
                      dataKey="department"
                      className="text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="attrition" name="Left" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="active" name="Active" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  <strong>Insight:</strong> Departments with higher attrition rates may indicate
                  issues with workload, management, or career growth opportunities. Consider
                  conducting department-specific surveys to understand concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <CardTitle>Salary vs Attrition</CardTitle>
              </div>
              <CardDescription>
                Analyze the relationship between compensation and employee retention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis
                      type="number"
                      dataKey="salary"
                      name="Salary"
                      className="text-xs"
                      label={{ value: 'Salary ($)', position: 'insideBottom', offset: -5 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="number"
                      dataKey="count"
                      name="Employees"
                      className="text-xs"
                      label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Salary') return `$${value.toLocaleString()}`;
                        return value;
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Left Company"
                      data={salaryData.filter((d) => d.attrition)}
                      fill="#ef4444"
                    />
                    <Scatter
                      name="Active"
                      data={salaryData.filter((d) => !d.attrition)}
                      fill="#10b981"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  <strong>Insight:</strong> Employees with lower salaries tend to have higher
                  attrition rates. Competitive compensation packages are crucial for retention,
                  especially in high-demand roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <CardTitle>Job Role Distribution</CardTitle>
              </div>
              <CardDescription>
                Distribution of employees across different job roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  <strong>Insight:</strong> Understanding role distribution helps identify areas
                  with potential talent gaps or overstaffing. Roles with high attrition may need
                  better career progression paths or improved job satisfaction initiatives.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                <CardTitle>Key Takeaways</CardTitle>
              </div>
              <CardDescription>Data-driven insights for HR decision making</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Focus on High-Risk Departments</h4>
                <p className="text-sm text-slate-700">
                  Departments with consistently high attrition should receive immediate attention.
                  Consider exit interviews and engagement surveys to identify root causes.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Competitive Compensation Matters</h4>
                <p className="text-sm text-slate-700">
                  Regular market benchmarking ensures salaries remain competitive. Employees leaving
                  for better pay can be prevented with timely adjustments and clear compensation
                  policies.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Career Development is Critical</h4>
                <p className="text-sm text-slate-700">
                  Roles with limited growth opportunities see higher turnover. Implement mentorship
                  programs, training initiatives, and clear career progression paths to improve
                  retention.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Use Predictive Analytics</h4>
                <p className="text-sm text-slate-700">
                  Don't wait for employees to leave. Use the prediction tool to identify at-risk
                  employees early and take proactive retention measures before it's too late.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
