import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { medicalRecordService, MedicalRecordWithDetails } from '@/services/medicalRecordService';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';

export const MedicalRecordsPage: React.FC = () => {
  const { role } = useAuth();
  const [records, setRecords] = useState<MedicalRecordWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isReceptionist = role === 'receptionist';

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await medicalRecordService.getAll();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      record.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientName = (record: MedicalRecordWithDetails) => {
    if (record.patient) {
      return `${record.patient.first_name} ${record.patient.last_name}`;
    }
    return '-';
  };

  const getDoctorName = (record: MedicalRecordWithDetails) => {
    if (record.doctor) {
      return `Dr. ${record.doctor.first_name} ${record.doctor.last_name}`;
    }
    return '-';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">Manage patient medical records</p>
          </div>
          {!isReceptionist && (
            <Link to={ROUTES.MEDICAL_RECORD_NEW}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Record
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    {isReceptionist && <TableHead>Doctor Name</TableHead>}
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {record.record_id}
                        </div>
                      </TableCell>
                      <TableCell>{record.patient?.patient_id || '-'}</TableCell>
                      <TableCell>{getPatientName(record)}</TableCell>
                      {isReceptionist && <TableCell>{getDoctorName(record)}</TableCell>}
                      <TableCell>{new Date(record.visit_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.visit_type}</TableCell>
                      <TableCell>{record.diagnosis || '-'}</TableCell>
                      <TableCell>
                        <Link to={`/medical-records/${record.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
