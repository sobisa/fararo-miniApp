
import type { ConfigOption } from "../../interfaces/IHMI";
import { SIZES } from "./HMIConfigs";

export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

export const generateRange = (max: number): ConfigOption[] =>
  Array.from({ length: max + 1 }, (_, i) => ({
    value: i.toString(),
    label: i.toString(),
  }));

export const getRelayOptions = (size: string): ConfigOption[] => {
  const sizeInfo = SIZES[size];
  return (
    sizeInfo?.relay.map((value) => ({
      value: value.toString(),
      label: value.toString(),
    })) || []
  );
};

export const getDefaultRelayNum = (size: string): string => {
  const sizeInfo = SIZES[size];
  return sizeInfo?.relay[0]?.toString() || '5';
}

export   const handleCopy = copyToClipboard;
