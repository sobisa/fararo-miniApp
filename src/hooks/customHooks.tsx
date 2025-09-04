import { useState, useEffect, useMemo } from 'react';
import type { FileData, HMIConfigState } from '../interfaces/IHMI';
import { SIZES } from '../app/features/HMIConfigs';
import { loadExcelData } from '../app/features/ReadExcel';
import { generateRange } from '../app/features/UtilityFunctions';
import { MODEL_OPTIONS_5, type PLCConfigState } from '../interfaces/IPLC';

export const useExcelData = () => {
  const [data, setData] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const jsonData = await loadExcelData();
      if (mounted) {
        setData(jsonData);
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading };
};

export const useHMICalculations = (
  config: HMIConfigState,
  data: FileData[],
  relayNum: string
) => {
  const currentPac = useMemo(
    () => data.find((item) => item.name === `PACs ${config.size}`) || null,
    [data, config.size]
  );
  const priceExtras = useMemo(() => {
    if (!data.length) return 0;

    let extra = 0;

    // Relay price
    if (config.output === 'R' && data[7]?.price) {
      extra += data[7].price * parseInt(relayNum);
    }

    // Analog inputs/outputs
    if (data[5]?.price) extra += data[5].price * parseInt(config.ai);
    if (data[6]?.price) extra += data[6].price * parseInt(config.ao);

    // SD Card
    if (config.sdCard === 'S' && data[3]?.price) {
      extra += data[3].price;
    }

    // LAN for 7035E
    if (config.size === '7035E' && config.lan === 'L' && data[4]?.price) {
      extra += data[4].price;
    }

    return extra;
  }, [config, data, relayNum]);

  const currentPrice = useMemo(
    () => (currentPac?.price || 0) + priceExtras,
    [currentPac?.price, priceExtras]
  );

  const currentDescription = useMemo(() => {
    if (!currentPac) return '';
    const sizeInfo = SIZES[config.size];

    if (!sizeInfo) return '';

    const { outputs } = sizeInfo;
    const relayCount = parseInt(relayNum);
    const transistorCount = outputs - relayCount;

    const transistorOutput =
      transistorCount > 0 ? `و ${transistorCount} عدد خروجی ترانزیستوری` : '';

    const parts = [
      'آپشن ها:',
      config.voltage === 'AC' ? 'تغذیه 220 ولت AC' : 'منبع تغذیه 24 ولت DC',
      config.output === 'T'
        ? `دارای ${outputs} عدد خروجی ترانزیستوری`
        : `دارای ${relayNum} عدد خروجی رله‌ای  ${transistorOutput}`,
    ];

    if (config.ai !== '0') parts.push(`دارای ${config.ai} عدد ورودی آنالوگ`);
    if (config.ao !== '0') parts.push(`دارای ${config.ao} عدد خروجی آنالوگ`);

    parts.push(
      config.sdCard === 'S' ? 'دارای کارت حافظه 16 گیگ' : 'فاقد کارت حافظه'
    );

    if (config.size === '7035E') {
      parts.push(config.lan === 'L' ? 'دارای پورت اترنت' : 'بدون پورت اترنت');
    }

    return ` ${currentPac.description} \n    ${parts.join(' - ')}`;
  }, [currentPac, config, relayNum]);

  const currentOptions = useMemo(() => {
    console.log(relayNum);
    const parts = [
      `Power: ${config.voltage}`,
      `Output: ${config.output}`,
      `AI: ${config.ai}`,
      `AO: ${config.ao}`,
      `SD: ${config.sdCard}`,
      `R: ${relayNum}`,
    ];

    if (config.size === '7035E') {
      parts.push(`Lan: ${config.lan}`);
    }

    return parts.join('\n         ');
  }, [config, relayNum]);

  const currentPartNumber = useMemo(
    () =>
      `PACs${config.size}-${config.voltage}${config.output}${config.ai}${config.ao}${config.sdCard}${config.lan}`,
    [config]
  );

  return {
    currentPac,
    priceExtras,
    currentPrice,
    currentDescription,
    currentOptions,
    currentPartNumber,
  };
};
export const usePLCCalculations = (
  config: PLCConfigState,
  data: FileData[]
) => {
  const currentPLC = useMemo(() => {
    return data.find((item) => item.name === config.model) || null;
  }, [data, config]);
  const currentPrice = useMemo(() => currentPLC?.price || 0, [currentPLC]);
  const currentPartNumber = useMemo(() => {
    const model = MODEL_OPTIONS_5.find((plc) => plc.value == currentPLC?.name);
    return model?.label;
  }, [currentPLC]);
  return { currentPLC, currentPrice, currentPartNumber };
};

export const useConfigOptions = (config: HMIConfigState) => {
  return useMemo(() => {
    const sizeInfo = SIZES[config.size];
    if (!sizeInfo) return { aiOptions: [], aoOptions: [] };

    const { maxAnalog } = sizeInfo;
    const aiNum = parseInt(config.ai);
    const aoNum = parseInt(config.ao);

    const aiOptions = generateRange(4).map((option) => ({
      ...option,
      disabled:
        parseInt(option.value) + aoNum > maxAnalog ||
        (config.size === '7035E' && parseInt(option.value) > 2),
    }));

    const aoOptions = generateRange(4).map((option) => ({
      ...option,
      disabled:
        aiNum + parseInt(option.value) > maxAnalog ||
        (config.size === '7035E' && parseInt(option.value) > 2),
    }));

    return { aiOptions, aoOptions };
  }, [config.size, config.ai, config.ao]);
};
