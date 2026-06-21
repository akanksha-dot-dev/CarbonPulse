/**
 * EcoTrack Marketplace & Offset Types
 */

// ─── Carbon Offset Projects ───────────────────────────────────────────────────

export type OffsetProjectType = 'direct_air_capture' | 'reforestation' | 'renewable_energy' | 'methane_capture' | 'ocean_protection';
export type OffsetVerification = 'Gold Standard' | 'VCS' | 'American Carbon Registry' | 'Climate Action Reserve';

export interface OffsetProject {
  id: string;
  name: string;
  description: string;
  type: OffsetProjectType;
  location: string;
  emoji: string;
  /** USD per tonne CO₂e */
  pricePerTonneUSD: number;
  /** Eco-Token cost per tonne (alternative to USD) */
  tokenCostPerTonne: number;
  verification: OffsetVerification;
  imageUrl?: string;
  impactDescription: string;
  co2SequesteredPerYear: string;
  sustainableDevelopmentGoals: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface OffsetPurchase {
  id: string;
  projectId: string;
  projectName: string;
  tonnes: number;
  priceUSD: number;
  tokensUsed: number;
  purchasedAt: string;
  status: 'pending' | 'confirmed' | 'retired';
  stripeSessionId?: string;
  certificate?: string;
}

// ─── Marketplace Vendor Offers ────────────────────────────────────────────────

export type OfferCategory = 'transit' | 'sustainable_brand' | 'food' | 'energy' | 'tree_planting' | 'other';

export interface MarketplaceOffer {
  id: string;
  vendorName: string;
  vendorLogo?: string;
  title: string;
  description: string;
  category: OfferCategory;
  /** Eco-Token cost to redeem */
  tokenCost: number;
  /** USD value of the offer */
  discountValueUSD: number;
  expiresAt?: string;
  isAvailable: boolean;
  redemptionCode?: string;
  terms: string;
  emoji: string;
}

// ─── Tree-Nation ──────────────────────────────────────────────────────────────

export interface TreeDonationResult {
  success: boolean;
  treesPlanted: number;
  projectName: string;
  co2SequesteredKg: number;
  certificateUrl?: string;
  errorMessage?: string;
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export interface StripeCheckoutMeta {
  projectId: string;
  tonnes: number;
  userId: string;
}
