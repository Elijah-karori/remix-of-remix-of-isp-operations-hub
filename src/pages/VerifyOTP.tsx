import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email || "";
  const verificationType = location.state?.type || "registration"; // registration, passwordless, password-reset

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (verificationType === "registration") {
        await authApi.verifyRegistrationOTP(email, otp);
        setSuccess(true);
        setTimeout(() => navigate("/login", { state: { message: "Account verified! You can now login." } }), 2000);
      } else if (verificationType === "passwordless") {
        await authApi.verifyPasswordlessOTP(email, otp);
        setSuccess(true);
        setTimeout(() => navigate("/"), 1500);
      } else if (verificationType === "password-reset") {
        // Store token and redirect to reset password page
        navigate("/reset-password", { state: { email, otp } });
      }
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      if (verificationType === "registration") {
        await authApi.requestRegistrationOTP(email);
      } else if (verificationType === "passwordless") {
        await authApi.requestPasswordlessLogin(email);
      } else if (verificationType === "password-reset") {
        await authApi.requestPasswordReset(email);
      }
      setResendCooldown(60);
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    switch (verificationType) {
      case "registration": return "Verify Your Email";
      case "passwordless": return "Enter Login Code";
      case "password-reset": return "Reset Password";
      default: return "Enter Verification Code";
    }
  };

  const getDescription = () => {
    switch (verificationType) {
      case "registration": return `We've sent a 6-digit code to ${email}. Enter it below to verify your account.`;
      case "passwordless": return `We've sent a login code to ${email}. Enter it below to sign in.`;
      case "password-reset": return `We've sent a reset code to ${email}. Enter it below to reset your password.`;
      default: return `Enter the 6-digit code sent to ${email}`;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">
                {verificationType === "passwordless" ? "Login Successful!" : "Verification Successful!"}
              </h2>
              <p className="text-muted-foreground">
                {verificationType === "passwordless" 
                  ? "Redirecting to dashboard..."
                  : "Your account has been verified. Redirecting to login..."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleVerify} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
                className="text-primary"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link 
              to="/login" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
