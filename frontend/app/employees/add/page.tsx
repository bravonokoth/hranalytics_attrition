'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────────
// 1. MAPPINGS TO MATCH BACKEND
// ──────────────────────────────────────────────────────────────
const departments = ['HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Operations', 'Research & Development'];
const jobRoles = [
  'Manager', 'Senior Engineer', 'Software Engineer', 'Sales Representative',
  'Sales Executive', 'Marketing Manager', 'HR Manager', 'Analyst', 'Data Scientist', 'Product Manager',
];
const educationMap: Record<string, number> = {
  'Below College': 1,
  'College': 2,
  'Bachelor': 3,
  'Master': 4,
  'Doctor': 5,
};

export default function AddEmployeePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Minimal form – only what we really need
  const [form, setForm] = useState({
    age: '',
    department: '',
    jobRole: '',
    salary: '',           // annual → we’ll convert to monthly_income
    education: '',
    yearsAtCompany: '',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ──────────────────────────────────────────────────────────────
  
  // ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        age: Number(form.age),
        department: form.department,
        job_role: form.jobRole,                     // ← backend uses snake_case
        monthly_income: Math.round(Number(form.salary)), // salary → monthly_income
        education: educationMap[form.education],    // string → int
        years_at_company: Number(form.yearsAtCompany),

        // Required defaults (you can expose them later)
        standard_hours: 80,
        employee_count: 1,
        over_18: 'Y',
        job_satisfaction: 3,
        work_life_balance: 3,
        environment_satisfaction: 3,
        attrition: 'No',
      };

      console.log('Sending payload →', payload); // ← devtools check
      await api.employees.create(payload);

      toast.success('Employee added successfully');
      router.push('/employees');
    } catch (error: any) {
      const msg = error?.details?.detail
        ? error.details.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
        : error.message || 'Failed to add employee';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 3. UI (unchanged, just a bit cleaned up)
  // ──────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6 py-8"
      >
        <div>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-600 mt-1">Minimal fields – everything else uses smart defaults</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>All fields are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="70"
                    placeholder="30"
                    value={form.age}
                    onChange={e => handleChange('age', e.target.value)}
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={form.department} onValueChange={v => handleChange('department', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Role */}
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role *</Label>
                  <Select value={form.jobRole} onValueChange={v => handleChange('jobRole', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Annual Salary */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary (₹) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    placeholder="1000000"
                    value={form.salary}
                    onChange={e => handleChange('salary', e.target.value)}
                    required
                  />
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level *</Label>
                  <Select value={form.education} onValueChange={v => handleChange('education', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(educationMap).map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Years at Company */}
                <div className="space-y-2">
                  <Label htmlFor="yearsAtCompany">Years at Company *</Label>
                  <Input
                    id="yearsAtCompany"
                    type="number"
                    min="0"
                    max="40"
                    placeholder="5"
                    value={form.yearsAtCompany}
                    onChange={e => handleChange('yearsAtCompany', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding...' : 'Add Employee'}
                </Button>
                <Link href="/employees" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}