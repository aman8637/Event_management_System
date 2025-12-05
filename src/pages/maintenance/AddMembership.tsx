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
import { z } from 'zod';
import { addMonths, addYears, format } from 'date-fns';

const membershipSchema = z.object({
  memberName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200),
  duration: z.enum(['6_months', '1_year', '2_years']),
});

type MembershipDuration = '6_months' | '1_year' | '2_years';

export default function AddMembership() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    memberName: '',
    email: '',
    phone: '',
    address: '',
    duration: '6_months' as MembershipDuration,
  });

  // Redirect non-admins
  if (role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const calculateEndDate = (duration: MembershipDuration): string => {
    const startDate = new Date();
    switch (duration) {
      case '6_months':
        return format(addMonths(startDate, 6), 'yyyy-MM-dd');
      case '1_year':
        return format(addYears(startDate, 1), 'yyyy-MM-dd');
      case '2_years':
        return format(addYears(startDate, 2), 'yyyy-MM-dd');
    }
  };

  const generateMembershipNumber = async (): Promise<string> => {
    const { data, error } = await supabase
      .from('memberships')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const count = data ? data.length + 1 : 1;
    const { count: totalCount } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true });
    
    return `MEM${String((totalCount || 0) + 1).padStart(6, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = membershipSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      const membershipNumber = await generateMembershipNumber();
      const endDate = calculateEndDate(formData.duration);

      const { error } = await supabase.from('memberships').insert({
        membership_number: membershipNumber,
        member_name: formData.memberName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        duration: formData.duration,
        end_date: endDate,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(`Membership created successfully! Number: ${membershipNumber}`);
      setFormData({
        memberName: '',
        email: '',
        phone: '',
        address: '',
        duration: '6_months',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create membership');
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="page-header">Add Membership</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>New Member Registration</CardTitle>
            <CardDescription>All fields are mandatory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="memberName">Member Name *</Label>
                <Input
                  id="memberName"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="member@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Membership Duration *</Label>
                <RadioGroup
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value as MembershipDuration })}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="6_months" id="6_months" />
                    <Label htmlFor="6_months" className="flex-1 cursor-pointer">
                      <span className="font-medium">6 Months</span>
                      <span className="text-sm text-muted-foreground ml-2">(Default)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="1_year" id="1_year" />
                    <Label htmlFor="1_year" className="flex-1 cursor-pointer">
                      <span className="font-medium">1 Year</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="2_years" id="2_years" />
                    <Label htmlFor="2_years" className="flex-1 cursor-pointer">
                      <span className="font-medium">2 Years</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Add Membership'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setFormData({
                    memberName: '',
                    email: '',
                    phone: '',
                    address: '',
                    duration: '6_months',
                  })}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}