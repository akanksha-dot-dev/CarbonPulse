/**
 * EcoTrack Integration Types
 * Covers Plaid FinTech, IoT (Nest/Tesla), Google Calendar, OCR.
 */

// ─── Plaid FinTech ────────────────────────────────────────────────────────────

export type PlaidConnectionStatus = 'disconnected' | 'pending' | 'connected' | 'error';

export interface PlaidAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  mask: string; // last 4 digits
  balanceCurrent: number;
  currency: string;
}

export interface PlaidTransaction {
  id: string;
  accountId: string;
  date: string;
  amount: number; // positive = spend
  name: string;
  merchantName?: string;
  /** Plaid's personal finance category */
  category: string[];
  /** MCC code if available */
  mcc?: number;
}

export interface MappedTransaction extends PlaidTransaction {
  /** Mapped CO₂ factor in kgCO₂e per dollar */
  emissionFactor: number;
  /** Estimated kgCO₂e for this transaction */
  estimatedKgCO2e: number;
  /** Which EcoTrack category this maps to */
  ecoCategory: 'transport' | 'energy' | 'diet' | 'consumption' | 'ignore';
  label: string;
}

export interface PlaidState {
  status: PlaidConnectionStatus;
  accounts: PlaidAccount[];
  transactions: MappedTransaction[];
  lastSyncAt: string | null;
  linkToken: string | null;
  monthlyKgCO2e: number;
  errorMessage?: string;
}

// ─── IoT — Smart Home & EV ────────────────────────────────────────────────────

export type IoTProvider = 'nest' | 'ecobee' | 'tesla' | 'ford' | 'manual';
export type IoTConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';

export interface IoTDevice {
  id: string;
  provider: IoTProvider;
  name: string;
  type: 'thermostat' | 'ev_charger' | 'solar' | 'smart_plug';
  status: IoTConnectionStatus;
  lastDataAt: string | null;
}

export interface NestThermostatData {
  deviceId: string;
  displayName: string;
  /** Current temperature in Celsius */
  ambientTemperatureC: number;
  /** Target temperature */
  heatCelsius?: number;
  coolCelsius?: number;
  hvacMode: 'off' | 'heat' | 'cool' | 'heatcool';
  hvacState: 'off' | 'heating' | 'cooling';
  /** Estimated kWh consumed in last 24h */
  estimatedKwhToday: number;
  /** kgCO₂e from HVAC today */
  estimatedKgCO2eToday: number;
  timestamp: string;
}

export interface TeslaChargingSession {
  sessionId: string;
  vehicleName: string;
  startTime: string;
  endTime: string;
  /** kWh charged in session */
  energyAddedKwh: number;
  /** kgCO₂e based on grid intensity */
  kgCO2e: number;
  /** Miles added */
  milesAdded: number;
  chargerType: 'home' | 'supercharger' | 'destination';
}

export interface IoTState {
  devices: IoTDevice[];
  nestData: NestThermostatData | null;
  teslaHistory: TeslaChargingSession[];
  totalIoTKgCO2eToday: number;
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  /** Resolved travel distance in km */
  estimatedDistanceKm?: number;
  /** Predicted travel mode */
  predictedMode?: 'flight' | 'drive' | 'transit' | 'unknown';
  isOnline: boolean;
}

export interface TravelPrediction {
  event: CalendarEvent;
  /** kgCO₂e if user uses their current transport mode */
  baselineKgCO2e: number;
  /** kgCO₂e using the suggested greener mode */
  optimizedKgCO2e: number;
  savedKgCO2e: number;
  suggestion: string;
  suggestedMode: string;
  suggestedModeEmoji: string;
}

// ─── OCR Receipt Scanner ──────────────────────────────────────────────────────

export interface ReceiptLineItem {
  rawText: string;
  matchedFoodItem?: string;
  /** Category of food item */
  category: 'meat_beef' | 'meat_poultry' | 'fish' | 'dairy' | 'vegetables' | 'grains' | 'processed' | 'beverages' | 'unknown';
  /** Estimated weight in grams (inferred from price/qty) */
  estimatedGrams: number;
  /** kgCO₂e per 100g from GHG Protocol food data */
  kgCO2ePer100g: number;
  estimatedKgCO2e: number;
}

export interface OcrScanResult {
  success: boolean;
  rawText: string;
  confidence: number; // 0-100
  lineItems: ReceiptLineItem[];
  totalEstimatedKgCO2e: number;
  merchantName?: string;
  scanDate: string;
  errorMessage?: string;
}
