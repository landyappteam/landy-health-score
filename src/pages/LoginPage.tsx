import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

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
          <CardTitle className="text-lg">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your properties with peace of mind</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/60" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: "hsl(var(--hygge-sage))" }}>Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-background/60" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full text-white" disabled={loading} style={{ backgroundColor: "hsl(var(--hygge-sage))" }}>
              {loading ? <span className="landy-spinner" /> : <LogIn className="w-4 h-4" />}
              Sign In
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: "hsl(var(--hygge-sage))" }}>Sign up</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
