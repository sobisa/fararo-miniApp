export interface ConfigOption {
  value: string;
  label: string;
}
export interface PLCConfigState {
  model: string;
  sdCard: string;
}

export const MODEL_OPTIONS_5: ConfigOption[] = [
  { value: 'PACs 5100', label: 'PACs 5100' },
  { value: 'PACs 5110', label: 'PACs 5110' },
  { value: 'PACs 5120', label: 'PACs 5120' },
  { value: 'PACs 5130', label: 'PACs 5130' },
  { value: 'PACs 5131', label: 'PACs 5131' },
  { value: 'PACs 5250', label: 'PACs 5250' },
  { value: 'NIC 500', label: 'NIC 500' },
  { value: 'NIC 500 +', label: ' +NIC 500' },
  { value: 'NIC 500AI', label: 'NIC 500AI' },
];
export const SDCRD_OPTIONS: ConfigOption[] = [
  { value: 'S', label: 'دارد ' },
  { value: 'N', label: 'ندارد' },
];
export const PLC_INITIAL_CONFIG: PLCConfigState = {
  model: 'PACs 5100',
  sdCard: 'N',
};
