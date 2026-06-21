'use client';

/**
 * Onboarding page — Multi-step wizard for first-time setup.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/onboarding/WizardShell';
import { useUIStore } from '@/store/uiStore';
import { useCarbonStore } from '@/store/carbonStore';
import { Leaf } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const wizardCompleted = useUIStore((s) => s.wizardCompleted);
  const logCurrentSnapshot = useCarbonStore((s) => s.logCurrentSnapshot);

  useEffect(() => {
    if (wizardCompleted) {
      logCurrentSnapshot();
      router.push('/dashboard');
    }
  }, [wizardCompleted, router, logCurrentSnapshot]);

  return (
    <div className="min-h-screen mesh-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2">
              <Leaf className="w-6 h-6 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Let&apos;s measure your footprint
          </h1>
          <p className="text-slate-400">
            Answer a few questions across 4 areas. We&apos;ll calculate your CO₂ in real time.
          </p>
        </div>

        {/* Wizard */}
        <WizardShell />

        <p className="text-center text-xs text-slate-600 mt-6">
          🔒 All data is processed locally. Nothing is sent to any server without your permission.
        </p>
      </div>
    </div>
  );
}
