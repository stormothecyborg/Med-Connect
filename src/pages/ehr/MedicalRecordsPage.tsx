import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MedicalRecord } from '@/types';
import { medicalRecordService } from '@/services/medicalRecordService';
import { useToast } from '@/hooks/use-toast';
import { Search, FilePlus, Eye, FileText, Loader2, Calendar, User } from 'lucide-react';

export const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await medicalRecordService.getAll();
      setRecords(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load medical records', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = records.filter(r =>
    r.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground">View and manage patient medical records</p>
          </div>
          <Link to="/medical-records/new">
            <Button><FilePlus className="h-4 w-4 mr-2" />New Record</Button>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Visit Type</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.recordId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(record.visitDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{record.visitType}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {record.doctorName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/medical-records/${record.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
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
