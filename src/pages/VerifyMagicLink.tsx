
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi, setAccessToken } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const VerifyMagicLink = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"verifying" | "error">("verifying");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const verifyToken = async () => {
            try {
                // We need to implement this method in api.ts
                // Based on user feedback, the backend endpoint expects the token
                // The endpoint is likely POST /api/v1/auth/passwordless/verify with body { token }
                // OR it might be a GET request.
                // Given typically magic links are "clicked", but here we are in a SPA.
                // The backend 404'd on /auth/verify, so we are intercepting it here.
                // We will try to call the backend verification endpoint.

                await authApi.verifyMagicLink(token);

                toast.success("Successfully logged in!");
                navigate("/");
            } catch (error) {
                console.error("Verification failed:", error);
                setStatus("error");
                toast.error("Invalid or expired login link. Please try again.");
            }
        };

        verifyToken();
    }, [token, navigate]);

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        The login link is invalid or has expired.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Verifying your login...
                </p>
            </div>
        </div>
    );
};

export default VerifyMagicLink;
