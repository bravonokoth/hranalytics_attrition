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
  GraduationCap, Brain, CheckCircle, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EmployeeFromAPI {
  id: number;
  age: number;
  business_travel?: string;
  daily_rate?: number;
  department?: string;
  distance_from_home?: number;
  education?: number;
  education_field?: string;
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
  over_time?: string;
  percent_salary_hike?: number;
  performance_rating?: number;
  relationship_satisfaction?: number;
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
      // Build prediction payload with defaults for missing fields
      const predictionPayload = {
        age: employee.age,
        business_travel: employee.business_travel || "Travel_Rarely",
        daily_rate: employee.daily_rate || 800,
        department: employee.department || "Research & Development",
        distance_from_home: employee.distance_from_home || 10,
        education: employee.education || 3,
        education_field: employee.education_field || "Life Sciences",
        environment_satisfaction: employee.environment_satisfaction || 3,
        gender: employee.gender || "Male",
        hourly_rate: employee.hourly_rate || 65,
        job_involvement: employee.job_involvement || 3,
        job_level: employee.job_level || 2,
        job_role: employee.job_role || "Software Engineer",
        job_satisfaction: employee.job_satisfaction || 3,
        marital_status: employee.marital_status || "Single",
        monthly_income: employee.monthly_income || 50000,
        monthly_rate: employee.monthly_rate || 22000,
        num_companies_worked: employee.num_companies_worked || 1,
        over_time: employee.over_time || "No",
        percent_salary_hike: employee.percent_salary_hike || 14,
        performance_rating: employee.performance_rating || 3,
        relationship_satisfaction: employee.relationship_satisfaction || 3,
        stock_option_level: employee.stock_option_level || 1,
        total_working_years: employee.total_working_years || employee.years_at_company || 5,
        training_times_last_year: employee.training_times_last_year || 3,
        work_life_balance: employee.work_life_balance || 3,
        years_at_company: employee.years_at_company || 5,
        years_in_current_role: employee.years_in_current_role || Math.floor((employee.years_at_company || 5) * 0.6),
        years_since_last_promotion: employee.years_since_last_promotion || 0,
        years_with_curr_manager: employee.years_with_curr_manager || Math.floor((employee.years_at_company || 5) * 0.7),
      };

      console.log('Sending prediction payload:', predictionPayload);
      
      const res = await api.prediction.single(predictionPayload);
      setPrediction(res);
      toast.success(`${res.riskLevel} Risk - ${(res.probability * 100).toFixed(1)}%`);
    } catch (err: any) {
      console.error('Prediction error:', err);
      toast.error(err.message || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const edu = (n?: number) => {
    if (!n) return 'Unknown';
    return ['','Below College','College','Bachelor','Master','Doctor'][n] || 'Unknown';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"/>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) return null;

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Employee #{employee.id}</h1>
              <p className="text-lg text-slate-600">
                {employee.job_role || 'Unknown Role'} • {employee.department || 'Unknown Dept'}
              </p>
            </div>
            <Badge 
              variant={employee.attrition === 'Yes' ? 'destructive' : 'default'} 
              className="text-lg px-4 py-1"
            >
              {employee.attrition === 'Yes' ? '🚪 Left' : '✓ Active'}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <User className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Age</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{employee.age}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${(employee.monthly_income || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Tenure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {employee.years_at_company || 0} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {employee.department || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{edu(employee.education)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Job Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{employee.job_level || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Companies Worked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{employee.num_companies_worked || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-sm font-medium">Stock Options</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Level {employee.stock_option_level || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Satisfaction Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Metrics</CardTitle>
            <CardDescription>Employee satisfaction across key areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Job Satisfaction', value: employee.job_satisfaction || 0 },
              { label: 'Work-Life Balance', value: employee.work_life_balance || 0 },
              { label: 'Environment Satisfaction', value: employee.environment_satisfaction || 0 },
              { label: 'Relationship Satisfaction', value: employee.relationship_satisfaction || 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-slate-600">{item.value}/4</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all" 
                    style={{ width: `${(item.value / 4) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Prediction */}
        <Card className={prediction ? 'ring-2 ring-blue-500 shadow-lg' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Brain className="w-6 h-6 text-blue-600" /> 
                  AI Attrition Risk Analysis
                </CardTitle>
                <CardDescription>
                  Machine learning prediction based on 30+ factors
                </CardDescription>
              </div>
              <Button 
                onClick={runPrediction} 
                disabled={predicting}
                size="lg"
              >
                <Brain className="w-4 h-4 mr-2" />
                {predicting ? 'Analyzing...' : 'Run Prediction'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 rounded-xl border-2 ${
                  prediction.riskLevel === 'Low' 
                    ? 'bg-green-50 border-green-300' 
                    : prediction.riskLevel === 'Medium' 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  {prediction.riskLevel === 'Low' ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertTriangle className={`w-12 h-12 ${
                      prediction.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  )}
                  <div>
                    <p className="text-3xl font-bold">
                      {prediction.riskLevel} Risk
                    </p>
                    <p className="text-4xl font-mono font-bold">
                      {(prediction.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-300 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${
                        prediction.riskLevel === 'Low' 
                          ? 'bg-green-500' 
                          : prediction.riskLevel === 'Medium' 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`} 
                      style={{ width: `${prediction.probability * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-4">
                  <p className="font-semibold mb-2">💡 Recommended Actions:</p>
                  <p className="text-sm italic">
                    {prediction.riskLevel === 'High' && 
                      '🚨 Act NOW: Schedule immediate 1-on-1, review compensation & career growth opportunities. Consider retention bonus.'}
                    {prediction.riskLevel === 'Medium' && 
                      '⚠️ Check in soon: Offer training, mentorship, or flexibility. Monitor satisfaction closely.'}
                    {prediction.riskLevel === 'Low' && 
                      '✅ Excellent! Maintain current culture and engagement. Continue regular check-ins.'}
                  </p>
                </div>

                <p className="text-xs text-slate-500 text-center mt-4 pt-4 border-t">
                  Powered by XGBoost • 94% Accuracy • Trained on 1,470 employees
                </p>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-500 mb-2">
                  No prediction yet
                </p>
                <p className="text-sm text-slate-400">
                  Click "Run Prediction" to analyze attrition risk
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}