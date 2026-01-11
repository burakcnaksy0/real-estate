// Backend enum'larına karşılık gelen TypeScript tipleri

export enum Role {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN'
}

export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  SOLD = 'SOLD',
  DELETED = 'DELETED'
}

export enum RealEstateType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  RESIDENCE = 'RESIDENCE'
}

export enum HeatingType {
  NATURAL_GAS = 'NATURAL_GAS',
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  STOVE_HEATING = 'STOVE_HEATING',
  AIR_CONDITIONING = 'AIR_CONDITIONING'
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  LPG = 'LPG',
  HYBRID = 'HYBRID'
}

export enum Transmission {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC'
}

export enum LandType {
  LAND = 'LAND',
  FIELD = 'FIELD',
  VINEYARD = 'VINEYARD',
  GARDEN = 'GARDEN'
}

export enum WorkplaceType {
  SHOP = 'SHOP',
  OFFICE = 'OFFICE',
  FACTORY = 'FACTORY',
  WAREHOUSE = 'WAREHOUSE'
}

export enum OfferType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT'
}

// Backend entity'lerine karşılık gelen interface'ler

export interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  phoneNumber?: string;
  email: string;
  enabled: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export interface BaseListing {
  id: number;
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  status: ListingStatus;
  city: string;
  district: string;
  categorySlug: string;
  categoryName?: string;
  ownerId: number;
  ownerUsername: string;
  createdAt: string;
  updatedAt: string;
  listingType: string;

  imageUrl?: string;
  offerType: OfferType;
}

export interface RealEstate extends BaseListing {
  realEstateType: RealEstateType;
  roomCount: number;
  squareMeter: number;
  buildingAge: number;
  floor: number;
  heatingType: HeatingType;
  furnished: boolean;
}

export interface Vehicle extends BaseListing {
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: Transmission;
  kilometer: number;
  engineVolume?: string;
}

export interface Land extends BaseListing {
  landType: LandType;
  squareMeter: number;
  zoningStatus?: string;
  parcelNumber: number;
  islandNumber: number;
}

export interface Workplace extends BaseListing {
  workplaceType: WorkplaceType;
  squareMeter: number;
  floorCount: number;
  furnished: boolean;
}

// API Request/Response tipleri

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Create Request tipleri
export interface UpdateProfileRequest {
  name?: string;
  surname?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RealEstateCreateRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  categorySlug: string;
  city: string;
  district: string;
  realEstateType: RealEstateType;
  roomCount: number;
  squareMeter: number;
  buildingAge: number;
  floor: number;
  heatingType: HeatingType;
  furnished: boolean;
  offerType: OfferType;
}

export interface VehicleCreateRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  categorySlug: string;
  city: string;
  district: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: Transmission;
  kilometer: number;
  engineVolume?: string;
  offerType: OfferType;
}

export interface LandCreateRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  categorySlug: string;
  city: string;
  district: string;
  landType: LandType;
  squareMeter: number;
  zoningStatus?: string;
  parcelNumber: number;
  islandNumber: number;
  offerType: OfferType;
}

export interface WorkplaceCreateRequest {
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  categorySlug: string;
  city: string;
  district: string;
  workplaceType: WorkplaceType;
  squareMeter: number;
  floorCount: number;
  furnished: boolean;
  offerType: OfferType;
}

// Filter Request tipleri
export interface RealEstateFilterRequest {
  city?: string;
  district?: string;
  categorySlug?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  realEstateType?: RealEstateType;
  minRoomCount?: number;
  maxRoomCount?: number;
  minSquareMeter?: number;
  maxSquareMeter?: number;
  minBuildingAge?: number;
  maxBuildingAge?: number;
  minFloor?: number;
  maxFloor?: number;
  heatingType?: HeatingType;
  furnished?: boolean;
}

export interface VehicleFilterRequest {
  city?: string;
  district?: string;
  categorySlug?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  minKilometer?: number;
  maxKilometer?: number;
}

export interface LandFilterRequest {
  city?: string;
  district?: string;
  categorySlug?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  landType?: LandType;
  minSquareMeter?: number;
  maxSquareMeter?: number;
  zoningStatus?: string;
}

export interface WorkplaceFilterRequest {
  city?: string;
  district?: string;
  categorySlug?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  workplaceType?: WorkplaceType;
  minSquareMeter?: number;
  maxSquareMeter?: number;
  minFloorCount?: number;
  maxFloorCount?: number;
  furnished?: boolean;
}

// Pagination tipleri
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Favorite types
export interface Favorite {
  id: number;
  listingId: number;
  listingType: string;
  createdAt: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  city: string;
  district: string;
  imageUrl?: string;
  status: string;
}