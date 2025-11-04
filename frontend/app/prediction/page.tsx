'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Brain, Upload, CheckCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

// ────── MATCH YOUR BACKEND 100% ──────
const departments = ['HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Operations', 'Research & Development'];
const jobRoles = ['Manager', 'Senior Engineer', 'Software Engineer', 'Sales Representative', 'Marketing Manager'];
const educationMap: Record<string, number> = {
  'Below College': 1,
  'College': 2,
  'Bachelor': 3,
  'Master': 4,
  'Doctor': 5,
};

interface PredictionResult {
  prediction: 0 | 1;
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export default function PredictionPage() {
  const [tab, setTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [batchDone, setBatchDone] = useState(false);

  const [form, setForm] = useState({
    age: '',
    department: '',
    jobRole: '',
    salary: '',
    education: '',
    yearsAtCompany: '',
    jobSatisfaction: '3',
    workLifeBalance: '3',
    environmentSatisfaction: '3',
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ────── SINGLE PREDICTION (FIXED) ──────
  const runSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        age: Number(form.age),
        department: form.department,
        job_role: form.jobRole,
        monthly_income: Math.round(Number(form.salary)), // ← KEY FIX
        education: educationMap[form.education],        // ← KEY FIX
        years_at_company: Number(form.yearsAtCompany),
        job_satisfaction: Number(form.jobSatisfaction),
        work_life_balance: Number(form.workLifeBalance),
        environment_satisfaction: Number(form.environmentSatisfaction),

        // Required defaults (your model needs these)
        standard_hours: 80,
        employee_count: 1,
        over_18: 'Y',
      };

      console.log('Prediction payload →', payload); // ← Debug in DevTools
      const res = await api.prediction.single(payload);
      setResult(res);
      toast.success('AI prediction ready!');
    } catch (err: any) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  // ────── BATCH PREDICTION (FIXED) ──────
  const runBatch = async () => {
    if (!file) return toast.error('Upload a CSV first');

    setLoading(true);
    setBatchDone(false);

    try {
      const res = await api.prediction.batch(file);
      setBatchDone(true);
      toast.success(`Predicted ${res.total} employees`);
    } catch (err: any) {
      toast.error(err.message || 'Batch failed');
    } finally {
      setLoading(false);
    }
  };

  const riskStyle = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-50 border-green-300 text-green-800';
      case 'Medium': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'High': return 'bg-red-50 border-red-300 text-red-800';
      default: return 'bg-slate-50 border-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 py-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">AI Attrition Predictor</h1>
          <p className="text-slate-600 mt-2">Predict who might leave — before they do</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="single">Single Employee</TabsTrigger>
            <TabsTrigger value="batch">Batch CSV</TabsTrigger>
          </TabsList>

          {/* SINGLE */}
          <TabsContent value="single" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Enter Details</CardTitle>
                  <CardDescription>Fill all fields → get instant risk score</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={runSingle} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Age *</Label>
                        <Input type="number" min="18" max="70" required
                          value={form.age} onChange={e => update('age', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Department *</Label>
                        <Select value={form.department} onValueChange={v => update('department', v)}>
                          <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                          <SelectContent>
                            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Job Role *</Label>
                        <Select value={form.jobRole} onValueChange={v => update('jobRole', v)}>
                          <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                          <SelectContent>
                            {jobRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Annual Salary *</Label>
                        <Input type="number" placeholder="1000000" required
                          value={form.salary} onChange={e => update('salary', e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label>Education *</Label>
                        <Select value={form.education} onValueChange={v => update('education', v)}>
                          <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(educationMap).map(l => (
                              <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Years at Company *</Label>
                        <Input type="number" min="0" max="40" required
                          value={form.yearsAtCompany} onChange={e => update('yearsAtCompany', e.target.value)} />
                      </div>

                      {['jobSatisfaction', 'workLifeBalance', 'environmentSatisfaction'].map((key, i) => (
                        <div key={key} className="space-y-2">
                          <Label>{['Job', 'Work-Life', 'Environment'][i]} Satisfaction (1-5)</Label>
                          <Select value={form[key as keyof typeof form]} onValueChange={v => update(key as any, v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5].map(n => (
                                <SelectItem key={n} value={String(n)}>{n} - {n===1?'Very Low':n===5?'Very High':n===3?'Medium':'High'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                      <Brain className="w-5 h-5 mr-2" />
                      {loading ? 'Analyzing...' : 'Predict Risk'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Result */}
              <div className="space-y-6">
                {result ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={`border-4 ${riskStyle(result.riskLevel)}`}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {result.riskLevel === 'Low' ? 
                            <CheckCircle className="w-10 h-10 text-green-600" /> : 
                            <AlertTriangle className={`w-10 h-10 ${result.riskLevel==='Medium'?'text-yellow-600':'text-red-600'}`} />
                          }
                          <div>
                            <CardTitle className="text-2xl">{result.riskLevel} Risk</CardTitle>
                            <p className="text-4xl font-bold">{(result.probability*100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className={`h-4 rounded-full transition-all ${
                            result.riskLevel==='Low'?'bg-green-500':result.riskLevel==='Medium'?'bg-yellow-500':'bg-red-500'
                          }`} style={{ width: `${result.probability*100}%` }} />
                        </div>
                        <p className="text-sm italic">
                          {result.riskLevel === 'High' && '🚨 Act NOW: 1-on-1, raise, training'}
                          {result.riskLevel === 'Medium' && '⚠️ Check in soon — offer flexibility'}
                          {result.riskLevel === 'Low' && '✅ Keep doing what you’re doing!'}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="py-16 text-center">
                      <Brain className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Results appear here instantly</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* BATCH */}
          <TabsContent value="batch" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV</CardTitle>
                <CardDescription>Predict 1000s at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="border-4 border-dashed border-slate-300 rounded-xl p-12 text-center">
                  <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <Label htmlFor="csv" className="cursor-pointer text-lg font-semibold text-blue-600 hover:text-blue-700">
                    Click to upload
                  </Label>
                  <Input id="csv" type="file" accept=".csv" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                  <p className="text-sm text-slate-500 mt-2">CSV must match form fields</p>
                  {file && (
                    <p className="mt-4 font-medium text-slate-700">
                      <FileText className="inline w-5 h-5 mr-2" />
                      {file.name}
                    </p>
                  )}
                </div>

                <Button onClick={runBatch} size="lg" className="w-full" disabled={!file || loading}>
                  <Brain className="w-6 h-6 mr-3" />
                  {loading ? 'Processing...' : 'Run Batch AI'}
                </Button>

                {batchDone && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    className="p-8 bg-green-50 border-2 border-green-300 rounded-xl text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold">All Done!</p>
                    <p className="text-lg mt-2">Results ready to download</p>
                    <Button variant="outline" size="lg" className="mt-6">
                      <Download className="w-5 h-5 mr-2" />
                      Export CSV
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}