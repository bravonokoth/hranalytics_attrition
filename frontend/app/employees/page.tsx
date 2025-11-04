'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ────── MATCH BACKEND EXACTLY ──────
interface Employee {
  id: number;
  age: number;
  department: string;
  job_role: string;
  monthly_income: number;
  education: number;
  years_at_company: number;
  attrition: string | null;
  job_satisfaction?: number;
  work_life_balance?: number;
  environment_satisfaction?: number;
}

const educationLabels: Record<number, string> = {
  1: 'Below College',
  2: 'College',
  3: 'Bachelor',
  4: 'Master',
  5: 'Doctor',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [attrFilter, setAttrFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load once
  useEffect(() => {
    api.employees.list({ limit: 200 })
      .then(data => {
        setEmployees(data);
        setFiltered(data);
      })
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  // Filter live
  useEffect(() => {
    let list = [...employees];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.job_role?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== 'all') list = list.filter(e => e.department === deptFilter);
    if (attrFilter !== 'all') list = list.filter(e => (e.attrition === 'Yes') === (attrFilter === 'yes'));

    setFiltered(list);
  }, [search, deptFilter, attrFilter, employees]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.employees.delete(deleteId);
      toast.success('Employee deleted');
      setEmployees(prev => prev.filter(e => e.id !== deleteId));
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.department))).sort();

  const formatSalary = (n: number) => `$${Number(n).toLocaleString()}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-slate-600">Manage your workforce</p>
          </div>
          <Link href="/employees/add">
            <Button><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search role / dept..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={attrFilter} onValueChange={setAttrFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="no">Active</SelectItem>
                  <SelectItem value="yes">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No employees found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Tenure</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e, i) => (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <TableCell>#{e.id}</TableCell>
                        <TableCell>{e.job_role || '—'}</TableCell>
                        <TableCell>{e.department}</TableCell>
                        <TableCell>{e.age}</TableCell>
                        <TableCell className="font-medium">
                          {formatSalary(e.monthly_income)}
                        </TableCell>
                        <TableCell>{e.years_at_company ?? 0} yrs</TableCell>
                        <TableCell>
                          <Badge variant={e.attrition === 'Yes' ? 'destructive' : 'default'}>
                            {e.attrition === 'Yes' ? 'Left' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={`/employees/${e.id}`}>
                              <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(e.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="text-sm text-slate-600">
              Showing {filtered.length} of {employees.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}