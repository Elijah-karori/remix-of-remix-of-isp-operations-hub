import { useState } from 'react';
import { OTPRegistrationStep } from './OTPRegistrationStep';
import { SetPasswordStep } from './SetPasswordStep';
import { OnboardingFormStep } from './OnboardingFormStep';
import { ApprovalPendingStep } from './ApprovalPendingStep';
import { Progress } from '@/components/ui/progress';

export const UserOnboardingFlow = () => {
    const [step, setStep] = useState<'otp' | 'password' | 'onboarding' | 'pending'>('otp');
    const [userData, setUserData] = useState<any>({});

    const stepProgress = {
        otp: 25,
        password: 50,
        onboarding: 75,
        pending: 100
    };

    const steps = {
        otp: (
            <OTPRegistrationStep
                onSuccess={(data) => {
                    setUserData(prev => ({ ...prev, ...data }));
                    setStep('password');
                }}
            />
        ),
        password: (
            <SetPasswordStep
                onSuccess={() => setStep('onboarding')}
            />
        ),
        onboarding: (
            <OnboardingFormStep
                onComplete={(onboardingData) => {
                    setUserData(prev => ({ ...prev, ...onboardingData }));
                    setStep('pending');
                }}
            />
        ),
        pending: <ApprovalPendingStep />
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span>Step {Object.keys(steps).indexOf(step) + 1} of 4</span>
                        <span>{stepProgress[step]}% Complete</span>
                    </div>
                    <Progress value={stepProgress[step]} className="h-1.5" />
                </div>

                <div className="transition-all duration-300 ease-in-out">
                    {steps[step]}
                </div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Secured by ERP Shield &bull; Integrated with Organization SSO
                    </p>
                </div>
            </div>
        </div>
    );
};
