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
  ArrowLeft, User, Briefcase, DollarSign, Calendar,
  GraduationCap, TrendingUp, Brain, CheckCircle, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// MATCHES YOUR DB 100%
interface EmployeeFromAPI {
  id: number;
  age: number;
  department: string;
  job_role: string;
  monthly_income: number;
  education: number;
  years_at_company: number;
  attrition: string | null;
  job_satisfaction: number;
  work_life_balance: number;
  environment_satisfaction: number;
}

interface Prediction {
  riskLevel: 'Low' | 'Medium' | 'High';
  probability: number;
}

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeFromAPI | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (id) {
      api.employees.get(id as string)
        .then(setEmployee)
        .catch(() => {
          toast.error('Employee not found');
          router.push('/employees');
        })
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  const runPrediction = async () => {
    if (!employee) return;
    setPredicting(true);
    try {
      const res = await api.prediction.single({
        ...employee,
        // ML model expects snake_case + exact fields
        job_role: employee.job_role,
        years_at_company: employee.years_at_company,
        monthly_income: employee.monthly_income,
      });
      setPrediction(res);
      toast.success('Risk predicted!');
    } catch {
      toast.error('Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const edu = (n: number) => ['','Below College','College','Bachelor','Master','Doctor'][n] || 'Unknown';

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"/></div></DashboardLayout>;
  if (!employee) return null;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Employee #{employee.id}</h1>
              <p className="text-lg text-slate-600">
                {employee.job_role} • {employee.department}
              </p>
            </div>
            <Badge variant={employee.attrition === 'Yes' ? 'destructive' : 'default'} className="text-lg px-4">
              {employee.attrition === 'Yes' ? 'Left' : 'Active'}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card><CardHeader className="flex-row gap-2"><User className="w-4 h-4" /><CardTitle className="text-sm">Age</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{employee.age}</p></CardContent></Card>
          <Card><CardHeader className="flex-row gap-2"><DollarSign className="w-4 h-4" /><CardTitle className="text-sm">Salary</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">${employee.monthly_income.toLocaleString()}</p></CardContent></Card>
          <Card><CardHeader className="flex-row gap-2"><Calendar className="w-4 h-4" /><CardTitle className="text-sm">Tenure</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{employee.years_at_company} yrs</p></CardContent></Card>
          <Card><CardHeader className="flex-row gap-2"><Briefcase className="w-4 h-4" /><CardTitle className="text-sm">Dept</CardTitle></CardHeader><CardContent><p className="text-xl">{employee.department}</p></CardContent></Card>
          <Card><CardHeader className="flex-row gap-2"><GraduationCap className="w-4 h-4" /><CardTitle className="text-sm">Education</CardTitle></CardHeader><CardContent><p className="text-xl">{edu(employee.education)}</p></CardContent></Card>
        </div>

        {/* Satisfaction Bars */}
        <Card>
          <CardHeader><CardTitle>Satisfaction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['Job', 'Work-Life', 'Environment'].map((label, i) => {
              const val = [employee.job_satisfaction, employee.work_life_balance, employee.environment_satisfaction][i];
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label} Satisfaction</span>
                    <span className="text-slate-600">{val}/5</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${(val / 5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Prediction */}
        <Card className={prediction ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Attrition Risk
                </CardTitle>
                <CardDescription>AI-powered forecast</CardDescription>
              </div>
              <Button onClick={runPrediction} disabled={predicting}>
                {predicting ? 'Analyzing...' : 'Run Prediction'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <div className={`p-6 rounded-xl border-2 ${
                prediction.riskLevel === 'Low' ? 'bg-green-50 border-green-300' :
                prediction.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-4">
                  {prediction.riskLevel === 'Low' ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertTriangle className="w-10 h-10 text-red-600" />}
                  <div>
                    <p className="text-2xl font-bold">{prediction.riskLevel} Risk</p>
                    <p className="text-3xl font-mono">{(prediction.probability * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className={`h-4 rounded-full transition-all ${
                      prediction.riskLevel === 'Low' ? 'bg-green-500' :
                      prediction.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} style={{ width: `${prediction.probability * 100}%` }} />
                  </div>
                </div>
                <p className="mt-4 text-sm italic">
                  {prediction.riskLevel === 'High' && 'Act now: Schedule 1:1, review pay & growth.'}
                  {prediction.riskLevel === 'Medium' && 'Check in soon — offer training or flexibility.'}
                  {prediction.riskLevel === 'Low' && 'Great! Keep up the good culture.'}
                </p>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500">
                Click "Run Prediction" to see AI risk score
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}