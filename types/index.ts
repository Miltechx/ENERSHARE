export type UserRole = 'consumer' | 'producer' | 'retailer' | 'admin'
export type KycStatus = 'pending' | 'submitted' | 'verified' | 'rejected'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type TransactionType = 'purchase' | 'sale' | 'withdrawal' | 'deposit' | 'transfer'
export type EnergySource = 'solar' | 'generator' | 'inverter' | 'battery' | 'wind' | 'other'
export type NotificationType = 'transaction' | 'listing' | 'system' | 'kyc' | 'payment'
export type MeterType = 'solar' | 'generator' | 'inverter' | 'grid'
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  nin?: string
  bvn?: string
  role: UserRole
  kycStatus: KycStatus
  kycRejectionReason?: string
  avatarUrl?: string
  address?: string
  state: string
  city: string
  area?: string
  isActive: boolean
  onboardingCompleted: boolean
  createdAt: any
  updatedAt: any
}

export interface Wallet {
  userId: string
  kwhBalance: number
  nairaBalance: number
  totalEarned: number
  totalSpent: number
  updatedAt: any
}

export interface EnergyListing {
  id: string
  sellerId: string
  sellerName: string
  sellerState: string
  sellerCity: string
  title: string
  description?: string
  energySource: EnergySource
  kwhAvailable: number
  kwhSold: number
  pricePerKwh: number
  minPurchaseKwh: number
  maxPurchaseKwh?: number
  locationState: string
  locationCity: string
  locationArea?: string
  isActive: boolean
  expiresAt?: any
  createdAt: any
  updatedAt: any
}

export interface Transaction {
  id: string
  buyerId?: string
  buyerName?: string
  sellerId?: string
  sellerName?: string
  listingId?: string
  kwhAmount?: number
  pricePerKwh?: number
  totalNaira: number
  platformFee: number
  sellerPayout?: number
  status: TransactionStatus
  paystackReference?: string
  type: TransactionType
  notes?: string
  createdAt: any
  updatedAt: any
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  link?: string
  createdAt: any
}

export interface MeterReading {
  id: string
  userId: string
  readingKwh: number
  meterType: MeterType
  capacityKw?: number
  readingDate: string
  verified: boolean
  notes?: string
  createdAt: any
}

export interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amountNaira: number
  bankName: string
  accountNumber: string
  accountName: string
  status: WithdrawalStatus
  adminNotes?: string
  createdAt: any
  updatedAt: any
}

export interface PaymentLog {
  paystackReference: string
  userId: string
  transactionId?: string
  amountKobo: number
  status: string
  channel?: string
  metadata?: Record<string, any>
  createdAt: any
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]