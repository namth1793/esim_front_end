import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Lock, AlertCircle, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetToken = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    const { error } = await updatePassword(resetToken, password);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  if (success) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
            <CheckCircle className="mx-auto h-12 w-12 text-accent" />
            <h2 className="font-display text-xl font-bold text-foreground">Password updated</h2>
            <p className="text-muted-foreground">Your password has been reset successfully.</p>
            <Button onClick={() => navigate("/login")} className="bg-gradient-cta text-primary-foreground">Go to Login</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!resetToken) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="font-display text-xl font-bold text-foreground">Invalid reset link</h2>
            <p className="text-muted-foreground">This link may have expired. Please request a new password reset.</p>
            <Button onClick={() => navigate("/forgot-password")} variant="outline">Request New Link</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta">
                <Globe className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Set new password</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Min 6 characters" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm" type="password" placeholder="••••••••" className="pl-10" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-cta text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
