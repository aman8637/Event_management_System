import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  membership_number: string;
  member_name: string;
  duration: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Transactions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setDataLoading(false);
  };

  if (loading || !user) return null;

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case '6_months': return '6 Months';
      case '1_year': return '1 Year';
      case '2_years': return '2 Years';
      default: return duration;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-success hover:bg-success/90">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Transactions</h1>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent membership transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member No.</TableHead>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(txn.updated_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono">{txn.membership_number}</TableCell>
                        <TableCell className="font-medium">{txn.member_name}</TableCell>
                        <TableCell>{getDurationLabel(txn.duration)}</TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}