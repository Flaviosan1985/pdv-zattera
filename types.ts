
export enum ProductCategory {
  PIZZA = 'Pizza',
  SWEET_PIZZA = 'Pizza Doce',
  DRINK = 'Bebida',
  DESSERT = 'Sobremesa'
}

export enum PizzaSize {
  SMALL = 'Pequena', // Broto
  MEDIUM = 'Média',
  LARGE = 'Grande'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; 
  priceSmall?: number; 
  category: string; 
  image: string;
  allowSize?: boolean;
}

export interface CartItem {
  cartId: string;
  product: Product;
  secondProduct?: Product;
  thirdProduct?: Product;
  isHalfAndHalf?: boolean;
  quantity: number;
  selectedSize?: PizzaSize;
}

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH';

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  city: string;
}

export interface OrderAnalysisResult {
  items: {
    productId: string;
    quantity: number;
    size?: PizzaSize;
    isHalfAndHalf?: boolean;
    flavors?: string[]; // IDs para pizzas meio a meio
  }[];
  customerName?: string;
  customerPhone?: string;
  address?: Address;
  paymentMethod?: PaymentMethod;
  orderType?: 'DELIVERY' | 'PICKUP';
  confirmationMessage: string;
  missingInfo?: string[]; // Orientações do que falta no pedido
}

export interface PaymentPart {
  method: PaymentMethod;
  amount: number;
  cashGiven?: number;
}

export type OrderType = 'DELIVERY' | 'PICKUP';
export type OrderStatus = 'PENDING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface Motoboy {
  id: string;
  name: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: Address;
  lastOrderDate?: Date;
  totalOrders: number;
  totalSpent: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  motoboyId?: string;
  motoboyName?: string;
  orderType: OrderType;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  payments: PaymentPart[];
  splitPeople?: number;
  changeNeeded?: number;
  address?: Address;
  date: Date;
  satCfeId?: string;
  satXml?: string;
}

export interface RegisterSession {
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
  initialFloat: number;
  finalBalance?: number;
}

export interface PrinterSettings {
  printerName: string;
  paperWidth: '80mm' | '58mm';
  isInstalled: boolean;
}

export interface User {
  id: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'CASHIER';
}

export interface DeliveryFee {
  id: string;
  neighborhood: string;
  price: number;
}

export type FiscalModule = 'NONE' | 'NFC_E' | 'SAT';

// Define SatConfig and SatResponse to resolve import issues in satService.ts
export interface SatConfig {
  activationCode: string;
  signAC: string;
  printerModel?: string;
  isSimulation?: boolean;
}

export interface SatResponse {
  success: boolean;
  code: string;
  message: string;
  log?: string;
  chaveConsulta?: string;
  qrCode?: string;
  xml?: string;
}

export interface StoreConfig {
  name: string;
  logo: string;
  cnpj?: string;
  phone?: string;
  address?: string;
  deliveryFees: DeliveryFee[];
  fiscalModule: FiscalModule;
  nfce: {
    environment: 'HOMOLOGATION' | 'PRODUCTION';
    csc: string;
    cscId: string;
  };
  sat: SatConfig;
}