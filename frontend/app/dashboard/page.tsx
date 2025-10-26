'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, TrendingDown, Calendar, DollarSign, Star, Brain, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardData {
  totalEmployees: number;
  attritionRate: number;
  averageAge: number;
  averageSalary: number;
  jobSatisfaction: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await api.analytics.dashboard();
      setData(dashboardData);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = data
    ? [
        {
          name: 'Total Employees',
          value: data.totalEmployees.toLocaleString(),
          icon: Users,
          color: 'bg-blue-500',
          description: 'Active employees in the system',
        },
        {
          name: 'Attrition Rate',
          value: `${data.attritionRate.toFixed(1)}%`,
          icon: TrendingDown,
          color: 'bg-red-500',
          description: 'Employees who have left',
        },
        {
          name: 'Average Age',
          value: `${Math.round(data.averageAge)} years`,
          icon: Calendar,
          color: 'bg-green-500',
          description: 'Mean employee age',
        },
        {
          name: 'Average Salary',
          value: `$${data.averageSalary.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-yellow-500',
          description: 'Mean annual compensation',
        },
        {
          name: 'Job Satisfaction',
          value: `${data.jobSatisfaction.toFixed(1)}/5`,
          icon: Star,
          color: 'bg-purple-500',
          description: 'Average satisfaction score',
        },
      ]
    : [];

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
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your HR metrics and insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-slate-600 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <CardTitle>Attrition Prediction</CardTitle>
                </div>
                <CardDescription>
                  Use machine learning to predict which employees might leave soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Our AI model analyzes multiple factors to identify employees at risk of leaving,
                  helping you take proactive engagement steps.
                </p>
                <Link href="/prediction">
                  <Button className="w-full">
                    Run Prediction <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-600" />
                  <CardTitle>Employee Management</CardTitle>
                </div>
                <CardDescription>
                  View, add, and manage employee records and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 mb-4">
                  Access complete employee profiles, update information, and track their status
                  within the organization.
                </p>
                <Link href="/employees">
                  <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                    Manage Employees <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Link href="/employees/add">
                  <Button variant="outline" className="w-full">
                    Add New Employee
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </Link>
                <Link href="/prediction">
                  <Button variant="outline" className="w-full">
                    Predict Attrition
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
