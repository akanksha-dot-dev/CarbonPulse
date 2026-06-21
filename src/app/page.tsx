'use client';

/**
 * EcoTrack Landing Page — Hero with animated globe counter, feature highlights,
 * and CTA to start the wizard.
 */

import Link from 'next/link';
import { ArrowRight, Leaf, BarChart3, Zap, Shield, Globe } from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { useEffect, useState } from 'react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Instant CO₂ calculations as you adjust your habits. No waiting — see your impact live.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Gamified Actions',
    description: 'Earn badges and unlock achievements by taking real-world steps to reduce your footprint.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: Globe,
    title: 'Paris-Aligned Goals',
    description: 'See exactly how you compare to the Paris Agreement 2-tonne target and global averages.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All data is yours. Guest mode works with zero accounts. Firebase sync is optional.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
];

const STATS = [
  { label: 'US Annual Average', value: 14000, suffix: ' kg CO₂', description: 'per person, per year' },
  { label: 'Paris 2°C Target', value: 2000, suffix: ' kg CO₂', description: '7× less than current' },
  { label: 'Avg. Savings Possible', value: 4200, suffix: ' kg CO₂', description: 'with our top actions' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="mesh-bg">
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center"
        aria-label="Hero section"
      >
        {/* Decorative glow orbs */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #059669, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          Real-time Carbon Intelligence
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6 animate-slide-up">
          <span className="text-slate-100">Know Your</span>
          <br />
          <span className="gradient-text">Carbon Truth</span>
        </h1>

        <p className="max-w-xl text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          EcoTrack gives you a precise, live picture of your carbon footprint — then helps you shrink it with personalized, science-backed actions.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Link
            href="/onboarding"
            id="cta-start"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Calculate My Footprint
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-semibold text-base border border-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            View Dashboard
          </Link>
        </div>

        {/* Leaf icon float */}
        <div className="mt-16 animate-float" aria-hidden="true">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-emerald-500 rounded-3xl blur-xl opacity-25" />
            <div className="relative bg-emerald-500/15 border border-emerald-500/30 rounded-3xl p-6">
              <Leaf className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <section
        className="px-4 py-12 max-w-5xl mx-auto"
        aria-label="Key statistics"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ label, value, suffix, description }, i) => (
            <div
              key={label}
              className="glass-card p-6 text-center animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              {mounted && (
                <AnimatedCounter
                  value={value}
                  suffix={suffix}
                  decimals={0}
                  duration={1200}
                  className="text-3xl font-black gradient-text-emerald tabular-nums"
                  aria-label={`${label}: ${value}${suffix}`}
                />
              )}
              <p className="text-xs text-slate-600 mt-1">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────────────────── */}
      <section
        className="px-4 py-12 max-w-5xl mx-auto"
        aria-label="Platform features"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 text-center mb-2">
          Everything you need to go greener
        </h2>
        <p className="text-slate-500 text-center mb-10 text-sm">
          Built on EPA and GHG Protocol data — no guesswork, just science.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, border }, i) => (
            <div
              key={title}
              className={`glass-card ${bg} ${border} p-6 hover:scale-[1.02] transition-transform duration-200 animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`${bg} ${border} border w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center" aria-label="Call to action">
        <div className="max-w-2xl mx-auto glass-card p-10 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, #10b981, transparent 70%)' }}
            aria-hidden="true"
          />
          <h2 className="text-3xl font-bold text-slate-100 mb-3 relative">
            Start your journey today
          </h2>
          <p className="text-slate-400 mb-8 relative">
            Takes 3 minutes. No account required. Your data stays on your device.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 relative"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
