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

const departments = ['HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Operations', 'Research & Development'];
const jobRoles = [
  'Manager',
  'Senior Engineer',
  'Software Engineer',
  'Sales Representative',
  'Sales Executive',
  'Marketing Manager',
  'HR Manager',
  'Analyst',
  'Data Scientist',
  'Product Manager',
];
const educationLevels = ['Below College', 'College', 'Bachelor', 'Master', 'Doctor'];

export default function AddEmployeePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    department: '',
    salary: '',
    education: '',
    jobRole: '',
    yearsAtCompany: '',
    monthlyIncome: '',
    jobSatisfaction: '',
    workLifeBalance: '',
    environmentSatisfaction: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const employeeData = {
        name: formData.name,
        age: parseInt(formData.age),
        department: formData.department,
        salary: parseInt(formData.salary),
        education: formData.education,
        jobRole: formData.jobRole,
        yearsAtCompany: parseInt(formData.yearsAtCompany),
        monthlyIncome: parseInt(formData.monthlyIncome || formData.salary) / 12,
        jobSatisfaction: parseInt(formData.jobSatisfaction || '3'),
        workLifeBalance: parseInt(formData.workLifeBalance || '3'),
        environmentSatisfaction: parseInt(formData.environmentSatisfaction || '3'),
      };

      await api.employees.create(employeeData);
      toast.success('Employee added successfully');
      router.push('/employees');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-600 mt-1">Enter employee information below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Fill out the form to add a new employee to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="70"
                    placeholder="30"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role *</Label>
                  <Select value={formData.jobRole} onValueChange={(v) => handleChange('jobRole', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    placeholder="60000"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level *</Label>
                  <Select value={formData.education} onValueChange={(v) => handleChange('education', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsAtCompany">Years at Company *</Label>
                  <Input
                    id="yearsAtCompany"
                    type="number"
                    min="0"
                    max="40"
                    placeholder="5"
                    value={formData.yearsAtCompany}
                    onChange={(e) => handleChange('yearsAtCompany', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobSatisfaction">Job Satisfaction (1-5)</Label>
                  <Select
                    value={formData.jobSatisfaction}
                    onValueChange={(v) => handleChange('jobSatisfaction', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={String(rating)}>
                          {rating} - {rating === 1 ? 'Very Low' : rating === 2 ? 'Low' : rating === 3 ? 'Medium' : rating === 4 ? 'High' : 'Very High'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLifeBalance">Work-Life Balance (1-5)</Label>
                  <Select
                    value={formData.workLifeBalance}
                    onValueChange={(v) => handleChange('workLifeBalance', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={String(rating)}>
                          {rating} - {rating === 1 ? 'Very Poor' : rating === 2 ? 'Poor' : rating === 3 ? 'Good' : rating === 4 ? 'Better' : 'Best'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentSatisfaction">Environment Satisfaction (1-5)</Label>
                  <Select
                    value={formData.environmentSatisfaction}
                    onValueChange={(v) => handleChange('environmentSatisfaction', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={String(rating)}>
                          {rating} - {rating === 1 ? 'Very Low' : rating === 2 ? 'Low' : rating === 3 ? 'Medium' : rating === 4 ? 'High' : 'Very High'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding Employee...' : 'Add Employee'}
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
