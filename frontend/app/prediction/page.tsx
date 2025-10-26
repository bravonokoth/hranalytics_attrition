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

const departments = ['HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Operations', 'Research & Development'];
const jobRoles = ['Manager', 'Senior Engineer', 'Software Engineer', 'Sales Representative', 'Marketing Manager'];
const educationLevels = ['Below College', 'College', 'Bachelor', 'Master', 'Doctor'];

interface PredictionResult {
  prediction: 0 | 1;
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export default function PredictionPage() {
  const [activeTab, setActiveTab] = useState('single');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    department: '',
    salary: '',
    education: '',
    jobRole: '',
    yearsAtCompany: '',
    jobSatisfaction: '3',
    workLifeBalance: '3',
    environmentSatisfaction: '3',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSinglePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const employeeData = {
        age: parseInt(formData.age),
        department: formData.department,
        salary: parseInt(formData.salary),
        education: formData.education,
        jobRole: formData.jobRole,
        yearsAtCompany: parseInt(formData.yearsAtCompany),
        jobSatisfaction: parseInt(formData.jobSatisfaction),
        workLifeBalance: parseInt(formData.workLifeBalance),
        environmentSatisfaction: parseInt(formData.environmentSatisfaction),
      };

      const prediction = await api.prediction.single(employeeData);
      setResult(prediction);
      toast.success('Prediction completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to run prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchPrediction = async () => {
    if (!file) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setBatchResults(null);

    try {
      const results = await api.prediction.batch(file);
      setBatchResults(results);
      toast.success('Batch prediction completed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to run batch prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-50 border-green-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'High':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Attrition Prediction</h1>
          <p className="text-slate-600 mt-1">Use AI to predict employee attrition risk</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="single">Single Prediction</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                  <CardDescription>Enter employee details to predict attrition risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSinglePrediction} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name (optional)</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
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
                            <SelectValue placeholder="Select" />
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
                            <SelectValue placeholder="Select" />
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
                          placeholder="60000"
                          value={formData.salary}
                          onChange={(e) => handleChange('salary', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education">Education *</Label>
                        <Select value={formData.education} onValueChange={(v) => handleChange('education', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
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
                          placeholder="5"
                          value={formData.yearsAtCompany}
                          onChange={(e) => handleChange('yearsAtCompany', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobSatisfaction">Job Satisfaction (1-5) *</Label>
                        <Select value={formData.jobSatisfaction} onValueChange={(v) => handleChange('jobSatisfaction', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={String(rating)}>
                                {rating}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workLifeBalance">Work-Life Balance (1-5) *</Label>
                        <Select value={formData.workLifeBalance} onValueChange={(v) => handleChange('workLifeBalance', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={String(rating)}>
                                {rating}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="environmentSatisfaction">Environment Satisfaction (1-5) *</Label>
                        <Select
                          value={formData.environmentSatisfaction}
                          onValueChange={(v) => handleChange('environmentSatisfaction', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={String(rating)}>
                                {rating}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      <Brain className="w-4 h-4 mr-2" />
                      {isLoading ? 'Running Prediction...' : 'Run Prediction'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`border-2 ${getRiskColor(result.riskLevel)}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {result.riskLevel === 'Low' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <AlertTriangle
                              className={`w-6 h-6 ${
                                result.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                              }`}
                            />
                          )}
                          Prediction Result
                        </CardTitle>
                        <CardDescription>AI-powered attrition risk assessment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="text-3xl font-bold mb-2">{result.riskLevel} Risk</div>
                          <p className="text-slate-600">
                            {(result.probability * 100).toFixed(1)}% likelihood of leaving
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Attrition Probability</span>
                            <span>{(result.probability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                result.riskLevel === 'Low'
                                  ? 'bg-green-500'
                                  : result.riskLevel === 'Medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${result.probability * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-lg">
                          <p className="text-sm font-medium mb-2">What does this mean?</p>
                          <p className="text-sm text-slate-700">
                            {result.riskLevel === 'Low' &&
                              'This employee is likely to stay. Continue maintaining good working conditions and growth opportunities.'}
                            {result.riskLevel === 'Medium' &&
                              'This employee shows moderate risk of leaving. Consider engagement conversations and reviewing their career path.'}
                            {result.riskLevel === 'High' &&
                              'This employee might leave soon. Immediate action recommended: schedule meetings, review compensation, and address concerns.'}
                          </p>
                        </div>

                        {result.riskLevel !== 'Low' && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-2">Engagement Tips</p>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                              <li>Schedule a one-on-one meeting to discuss career goals</li>
                              <li>Review current compensation and benefits package</li>
                              <li>Identify opportunities for skill development and growth</li>
                              <li>Assess workload and work-life balance concerns</li>
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {!result && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Brain className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-slate-500 text-center">
                        Fill in the employee details and click "Run Prediction" to see results here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Prediction</CardTitle>
                <CardDescription>Upload a CSV file with multiple employee records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Click to upload CSV
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-slate-500">or drag and drop</p>
                    {file && (
                      <p className="text-sm font-medium text-slate-700 mt-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>

                <Button onClick={handleBatchPrediction} disabled={!file || isLoading} className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Run Batch Prediction'}
                </Button>

                {batchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="text-lg font-semibold">Batch Prediction Complete</div>
                    </div>
                    <p className="text-sm text-slate-700 mb-4">
                      Successfully analyzed {batchResults.total || 0} employees. Results have been generated.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Results
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
