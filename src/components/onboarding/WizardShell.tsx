'use client';

/**
 * WizardShell — Multi-step wizard container with progress indicator.
 */

import { useUIStore } from '@/store/uiStore';
import { Step1Transport } from './Step1Transport';
import { Step2Energy } from './Step2Energy';
import { Step3Diet } from './Step3Diet';
import { Step4Consumption } from './Step4Consumption';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const STEPS = [
  { label: 'Transport', emoji: '🚗' },
  { label: 'Energy', emoji: '⚡' },
  { label: 'Diet', emoji: '🥗' },
  { label: 'Consumption', emoji: '🛍️' },
];

export function WizardShell() {
  const wizardStep = useUIStore((s) => s.wizardStep);
  const nextWizardStep = useUIStore((s) => s.nextWizardStep);
  const prevWizardStep = useUIStore((s) => s.prevWizardStep);
  const completeWizard = useUIStore((s) => s.completeWizard);

  const isLastStep = wizardStep === 4;
  const isFirstStep = wizardStep === 1;

  const handleNext = () => {
    if (isLastStep) {
      completeWizard();
    } else {
      nextWizardStep();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Progress Indicator */}
      <div className="mb-8" role="list" aria-label="Wizard progress">
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < wizardStep;
            const isCurrent = stepNum === wizardStep;

            return (
              <div key={step.label} className="flex items-center flex-1 last:flex-none" role="listitem">
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                      transition-all duration-300 border-2
                      ${isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                      }
                    `}
                    aria-label={`Step ${stepNum}: ${step.label} ${isCompleted ? '(completed)' : isCurrent ? '(current)' : '(upcoming)'}`}
                  >
                    {isCompleted
                      ? <Check className="w-4 h-4" aria-hidden="true" />
                      : <span aria-hidden="true">{step.emoji}</span>
                    }
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isCurrent ? 'text-emerald-400' : isCompleted ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div
        className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
        role="region"
        aria-label={`Step ${wizardStep}: ${STEPS[wizardStep - 1].label}`}
      >
        <div className="min-h-[400px]">
          {wizardStep === 1 && <Step1Transport />}
          {wizardStep === 2 && <Step2Energy />}
          {wizardStep === 3 && <Step3Diet />}
          {wizardStep === 4 && <Step4Consumption />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800/60">
          <button
            onClick={prevWizardStep}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Go to previous step"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </button>

          <span className="text-xs text-slate-600" aria-live="polite">
            Step {wizardStep} of {STEPS.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-lg shadow-emerald-900/30"
            aria-label={isLastStep ? 'Complete setup and go to dashboard' : 'Go to next step'}
          >
            {isLastStep ? 'See My Results' : 'Continue'}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
