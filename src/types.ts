export interface LaptopSpecs {
  cpu: string;
  ram: string;
  storage: string;
  screen: string;
  graphics?: string;
}

export type LaptopCondition = 'Clean' | 'Very Clean' | 'Good';

export interface Laptop {
  id: string;
  name: string;
  brand: string;
  year: number;
  price: number;
  originalPrice?: number;
  condition: LaptopCondition;
  batteryHealth: number; // e.g., 88 for 88%
  batteryNote: string;
  specs: LaptopSpecs;
  image: string;
  additionalImages: string[];
  stockCount: number;
  useCategory: 'School' | 'Work' | 'Design';
  description: string;
  serialNumber: string;
  inspectionPassed: boolean;
  isSold?: boolean;
  buyerFeedback?: string;
  buyerName?: string;
  deliveredDate?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
  verifiedPurchase: boolean;
  laptopBought: string;
}

export type FilterBudget = 'all' | 'under-400' | '400-700' | '700-1000' | 'above-1000';
export type FilterBrand = 'all' | 'Apple' | 'Dell' | 'Lenovo' | 'HP';
export type FilterUse = 'all' | 'School' | 'Work' | 'Design';

export interface FilterState {
  budget: FilterBudget;
  brand: FilterBrand;
  use: FilterUse;
  searchQuery: string;
}
