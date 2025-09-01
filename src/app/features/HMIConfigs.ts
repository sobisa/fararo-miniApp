import type { SizeInfo, ConfigOption, ConfigState } from "../../interfaces/IHMI";

export const SIZES: Record<string, SizeInfo> = {
  '7035E': { display: '3.5 اینچ', outputs: 5, maxAnalog: 2, relay: [5] },
  '7070E2': { display: '7 اینچ', outputs: 12, maxAnalog: 3, relay: [12, 6] },
  '7101E': {
    display: '10 اینچ',
    outputs: 20,
    maxAnalog: 4,
    relay: [20, 15, 10, 5],
  },
} as const;

export const VOLTAGE_OPTIONS: ConfigOption[] = [
  { value: 'DC', label: '24V DC تغذیه' },
  { value: 'AC', label: '220V AC تغذیه' },
];

export const OUTPUT_OPTIONS: ConfigOption[] = [
  { value: 'T', label: 'خروجی ترانزیستوری' },
  { value: 'R', label: 'خروجی رله ای' },
];

export const SD_CARD_OPTIONS: ConfigOption[] = [
  { value: 'S', label: 'دارد' },
  { value: 'N', label: 'ندارد' },
];

export const LAN_OPTIONS: ConfigOption[] = [
  { value: 'L', label: 'دارد' },
  { value: 'N', label: 'ندارد' },
];

export const INITIAL_CONFIG: ConfigState = {
  size: '7035E',
  voltage: 'AC',
  output: 'T',
  ai: '0',
  ao: '0',
  sdCard: 'N',
  lan: 'L',
};
