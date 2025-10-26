'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  age: number;
  department: string;
  salary: number;
  jobRole: string;
  attrition: boolean;
  yearsAtCompany: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [attritionFilter, setAttritionFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, departmentFilter, attritionFilter, employees]);

  const loadEmployees = async () => {
    try {
      const data = await api.employees.list();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchQuery) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.jobRole.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    if (attritionFilter !== 'all') {
      const isAttrition = attritionFilter === 'yes';
      filtered = filtered.filter((emp) => emp.attrition === isAttrition);
    }

    setFilteredEmployees(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.employees.delete(id);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    } finally {
      setDeleteId(null);
    }
  };

  const departments = Array.from(new Set(employees.map((e) => e.department)));

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
            <p className="text-slate-600 mt-1">Manage your workforce</p>
          </div>
          <Link href="/employees/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={attritionFilter} onValueChange={setAttritionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="no">Active</SelectItem>
                  <SelectItem value="yes">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No employees found</h3>
                <p className="text-slate-600 mb-4">
                  {searchQuery || departmentFilter !== 'all' || attritionFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first employee'}
                </p>
                <Link href="/employees/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee, index) => (
                      <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.age}</TableCell>
                        <TableCell>${employee.salary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={employee.attrition ? 'destructive' : 'default'}>
                            {employee.attrition ? 'Left' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/employees/${employee.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(employee.id)}>
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
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
