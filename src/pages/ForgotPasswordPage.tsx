import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(var(--hygge-cream))" }}>
        <Card className="w-full max-w-sm text-center border-none shadow-lg" style={{ backgroundColor: "hsl(0 0% 100% / 0.85)" }}>
          <CardHeader>
            <CardTitle className="text-lg">Email sent</CardTitle>
            <CardDescription>If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link to="/login" className="text-sm hover:underline" style={{ color: "hsl(var(--hygge-sage))" }}>Back to login</Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(var(--hygge-cream))" }}>
      <Card className="w-full max-w-sm border-none shadow-lg" style={{ backgroundColor: "hsl(0 0% 100% / 0.85)" }}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Landy</span>
          </div>
          <CardTitle className="text-lg">Reset your password</CardTitle>
          <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/60" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full text-white" disabled={loading} style={{ backgroundColor: "hsl(var(--hygge-sage))" }}>
              {loading ? <span className="landy-spinner" /> : <Mail className="w-4 h-4" />}
              Send Reset Link
            </Button>
            <Link to="/login" className="text-sm text-muted-foreground hover:underline">Back to login</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
