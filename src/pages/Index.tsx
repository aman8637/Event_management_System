import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, Shield } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calendar className="h-12 w-12 text-primary" />
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                Event Manager
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Complete Membership Management System for your organization. 
              Manage members, track reports, and handle transactions efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Features</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Membership Management</h3>
              <p className="text-muted-foreground">
                Add new members, extend memberships, or cancel them with ease.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reports & Analytics</h3>
              <p className="text-muted-foreground">
                View comprehensive reports on membership status and statistics.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Secure access control with Admin and User roles for different permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Event Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}