import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { addMonths, addYears, format, parseISO } from 'date-fns';
import { Search, AlertCircle } from 'lucide-react';

type ExtensionType = '6_months' | '1_year' | '2_years' | 'cancel';

interface MembershipData {
  id: string;
  membership_number: string;
  member_name: string;
  email: string;
  phone: string;
  address: string;
  duration: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function UpdateMembership() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [action, setAction] = useState<ExtensionType>('6_months');

  // Redirect non-admins
  if (role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const searchMembership = async () => {
    if (!membershipNumber.trim()) {
      toast.error('Please enter a membership number');
      return;
    }

    setSearchLoading(true);
    setMembership(null);

    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('membership_number', membershipNumber.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Membership not found');
      } else {
        setMembership(data as MembershipData);
        setAction('6_months');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to search membership');
    }

    setSearchLoading(false);
  };

  const calculateNewEndDate = (currentEndDate: string, extension: ExtensionType): string => {
    const endDate = parseISO(currentEndDate);
    switch (extension) {
      case '6_months':
        return format(addMonths(endDate, 6), 'yyyy-MM-dd');
      case '1_year':
        return format(addYears(endDate, 1), 'yyyy-MM-dd');
      case '2_years':
        return format(addYears(endDate, 2), 'yyyy-MM-dd');
      default:
        return currentEndDate;
    }
  };

  const handleUpdate = async () => {
    if (!membership) return;
    setLoading(true);

    try {
      if (action === 'cancel') {
        const { error } = await supabase
          .from('memberships')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', membership.id);

        if (error) throw error;
        toast.success('Membership cancelled successfully');
      } else {
        const newEndDate = calculateNewEndDate(membership.end_date, action);
        const { error } = await supabase
          .from('memberships')
          .update({ 
            end_date: newEndDate,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', membership.id);

        if (error) throw error;
        toast.success(`Membership extended until ${format(parseISO(newEndDate), 'MMM dd, yyyy')}`);
      }

      // Refresh the membership data
      const { data } = await supabase
        .from('memberships')
        .select('*')
        .eq('id', membership.id)
        .single();
      
      if (data) setMembership(data as MembershipData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update membership');
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      case 'expired': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="page-header">Update Membership</h1>
        
        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Membership</CardTitle>
            <CardDescription>Enter membership number to search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value.toUpperCase())}
                placeholder="e.g., MEM000001"
                onKeyDown={(e) => e.key === 'Enter' && searchMembership()}
              />
              <Button onClick={searchMembership} disabled={searchLoading}>
                <Search className="h-4 w-4 mr-2" />
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details */}
        {membership && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Membership Details</CardTitle>
                  <CardDescription>{membership.membership_number}</CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(membership.status)}`}>
                  {membership.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Member Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Member Name</Label>
                  <p className="font-medium">{membership.member_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{membership.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{membership.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{membership.address}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{format(parseISO(membership.start_date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="font-medium">{format(parseISO(membership.end_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {membership.status === 'cancelled' && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive">This membership has been cancelled</p>
                </div>
              )}

              {/* Update Actions */}
              <div className="pt-4 border-t border-border">
                <Label className="text-base font-medium mb-4 block">Update Action</Label>
                <RadioGroup
                  value={action}
                  onValueChange={(value) => setAction(value as ExtensionType)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="6_months" id="extend_6_months" />
                    <Label htmlFor="extend_6_months" className="flex-1 cursor-pointer">
                      <span className="font-medium">Extend 6 Months</span>
                      <span className="text-sm text-muted-foreground ml-2">(Default)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="1_year" id="extend_1_year" />
                    <Label htmlFor="extend_1_year" className="flex-1 cursor-pointer">
                      <span className="font-medium">Extend 1 Year</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="2_years" id="extend_2_years" />
                    <Label htmlFor="extend_2_years" className="flex-1 cursor-pointer">
                      <span className="font-medium">Extend 2 Years</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-destructive/50 hover:bg-destructive/10 transition-colors">
                    <RadioGroupItem value="cancel" id="cancel_membership" />
                    <Label htmlFor="cancel_membership" className="flex-1 cursor-pointer text-destructive">
                      <span className="font-medium">Cancel Membership</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  variant={action === 'cancel' ? 'destructive' : 'default'}
                  className="flex-1"
                >
                  {loading ? 'Updating...' : (action === 'cancel' ? 'Cancel Membership' : 'Update Membership')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setMembership(null);
                    setMembershipNumber('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}