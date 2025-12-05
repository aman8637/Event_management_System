import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

interface MembershipStats {
  total: number;
  active: number;
  cancelled: number;
  expired: number;
}

interface Membership {
  id: string;
  membership_number: string;
  member_name: string;
  email: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function Reports() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [stats, setStats] = useState<MembershipStats>({ total: 0, active: 0, cancelled: 0, expired: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMemberships();
    }
  }, [user]);

  const fetchMemberships = async () => {
    setDataLoading(true);
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMemberships(data as Membership[]);
      
      const active = data.filter(m => m.status === 'active').length;
      const cancelled = data.filter(m => m.status === 'cancelled').length;
      const expired = data.filter(m => m.status === 'expired').length;
      
      setStats({
        total: data.length,
        active,
        cancelled,
        expired,
      });
    }
    setDataLoading(false);
  };

  if (loading || !user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'expired': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statCards = [
    { label: 'Total Members', value: stats.total, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Active', value: stats.active, icon: UserCheck, color: 'bg-success/10 text-success' },
    { label: 'Cancelled', value: stats.cancelled, icon: UserX, color: 'bg-destructive/10 text-destructive' },
    { label: 'Expired', value: stats.expired, icon: Clock, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="page-header">Reports</h1>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Membership Table */}
        <Card>
          <CardHeader>
            <CardTitle>Membership List</CardTitle>
            <CardDescription>All registered memberships</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : memberships.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No memberships found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell className="font-mono">{membership.membership_number}</TableCell>
                        <TableCell className="font-medium">{membership.member_name}</TableCell>
                        <TableCell>{membership.email}</TableCell>
                        <TableCell>{format(parseISO(membership.start_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(parseISO(membership.end_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(membership.status)}`}>
                            {membership.status}
                          </span>
                        </TableCell>
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