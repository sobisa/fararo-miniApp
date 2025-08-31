export interface Product {
  id: number;
  name: string;
  number: number;
  price: number;
  description: string;
  options: string;
}

export interface FileData {
  name: string;
  price: number;
  description: string;
}

export interface ConfigState {
  size: string;
  voltage: string;
  output: string;
  ai: string;
  ao: string;
  sdCard: string;
  lan: string;
}

export interface SizeInfo {
  display: string;
  outputs: number;
  maxAnalog: number;
  relay: number[];
}

export interface ConfigOption {
  value: string;
  label: string;
  disabled?: boolean;
}
