'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  age: number;
  department: string;
  salary: number;
  jobRole: string;
  education: string;
  attrition: boolean;
  yearsAtCompany: number;
  jobSatisfaction: number;
  workLifeBalance: number;
  environmentSatisfaction: number;
  prediction?: {
    riskLevel: 'Low' | 'Medium' | 'High';
    probability: number;
  };
}

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [params.id]);

  const loadEmployee = async () => {
    try {
      const data = await api.employees.get(params.id as string);
      setEmployee(data);
    } catch (error) {
      toast.error('Failed to load employee details');
      router.push('/employees');
    } finally {
      setIsLoading(false);
    }
  };

  const runPrediction = async () => {
    if (!employee) return;
    setIsPredicting(true);

    try {
      const result = await api.prediction.single(employee);
      setEmployee({
        ...employee,
        prediction: {
          riskLevel: result.riskLevel,
          probability: result.probability,
        },
      });
      toast.success('Prediction completed');
    } catch (error) {
      toast.error('Failed to run prediction');
    } finally {
      setIsPredicting(false);
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

  if (!employee) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'High':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-700';
      case 'Medium':
        return 'text-yellow-700';
      case 'High':
        return 'text-red-700';
      default:
        return 'text-slate-700';
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
              <p className="text-slate-600 mt-1">
                {employee.jobRole} in {employee.department}
              </p>
            </div>
            <Badge variant={employee.attrition ? 'destructive' : 'default'} className="text-lg px-4 py-2">
              {employee.attrition ? 'Left Company' : 'Active'}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age</CardTitle>
              <User className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.age} years</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${employee.salary.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Years at Company</CardTitle>
              <Calendar className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employee.yearsAtCompany} years</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Briefcase className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{employee.department}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Education</CardTitle>
              <GraduationCap className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{employee.education}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Role</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{employee.jobRole}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Metrics</CardTitle>
            <CardDescription>Employee satisfaction and well-being indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Job Satisfaction</span>
                <span className="text-sm text-slate-600">{employee.jobSatisfaction}/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(employee.jobSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Work-Life Balance</span>
                <span className="text-sm text-slate-600">{employee.workLifeBalance}/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(employee.workLifeBalance / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Environment Satisfaction</span>
                <span className="text-sm text-slate-600">{employee.environmentSatisfaction}/5</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(employee.environmentSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={employee.prediction ? 'border-2' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Attrition Risk Prediction
                </CardTitle>
                <CardDescription>ML-powered employee retention forecast</CardDescription>
              </div>
              <Button onClick={runPrediction} disabled={isPredicting}>
                {isPredicting ? 'Analyzing...' : employee.prediction ? 'Re-run' : 'Run Prediction'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {employee.prediction ? (
              <div className="space-y-4">
                <div
                  className={`p-6 rounded-lg ${
                    employee.prediction.riskLevel === 'Low'
                      ? 'bg-green-50 border border-green-200'
                      : employee.prediction.riskLevel === 'Medium'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {employee.prediction.riskLevel === 'Low' ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <AlertTriangle
                        className={`w-8 h-8 ${
                          employee.prediction.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}
                      />
                    )}
                    <div>
                      <div className="text-lg font-bold">
                        {employee.prediction.riskLevel} Risk Level
                      </div>
                      <div className="text-sm text-slate-600">
                        {(employee.prediction.probability * 100).toFixed(1)}% likelihood to leave
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Attrition Probability</span>
                      <span>{(employee.prediction.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          employee.prediction.riskLevel === 'Low'
                            ? 'bg-green-500'
                            : employee.prediction.riskLevel === 'Medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${employee.prediction.probability * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <p className="text-sm font-medium mb-2">Interpretation:</p>
                    <p className="text-sm text-slate-700">
                      {employee.prediction.riskLevel === 'Low' &&
                        'This employee is likely to stay with the company. Continue maintaining good working conditions and growth opportunities.'}
                      {employee.prediction.riskLevel === 'Medium' &&
                        'This employee shows moderate risk of leaving. Consider having engagement conversations and reviewing their career path.'}
                      {employee.prediction.riskLevel === 'High' &&
                        'This employee might leave soon. Immediate action recommended: schedule one-on-one meetings, review compensation, and address any concerns.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  No prediction has been run for this employee yet. Click the button above to analyze their
                  attrition risk using our ML model.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
