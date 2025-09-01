import {
  Box,
  Heading,
  Flex,
  Blockquote,
  Mark,
  Grid,
  Button,
  Text,
  NativeSelect,
} from '@chakra-ui/react';
import { memo, useCallback, useMemo, useState } from 'react';
import type {
  ConfigOption,
  ConfigState,
  CategoriesProps,
  Product,
} from '../../interfaces/IHMI';
import {
  useConfigOptions,
  useExcelData,
  useProductCalculations,
} from '../../hooks/customHooks';
import {
  INITIAL_CONFIG,
  LAN_OPTIONS,
  OUTPUT_OPTIONS,
  SD_CARD_OPTIONS,
  SIZES,
  VOLTAGE_OPTIONS,
} from '../features/HMIConfigs';
import {
  getDefaultRelayNum,
  getRelayOptions,
  handleCopy,
} from '../features/UtilityFunctions';
import PriceDisplay from '../sections/PriceDisplay';

// Memoized components
const ConfigSelector = memo<{
  title: string;
  value: string;
  options: ConfigOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}>(({ title, value, options, onChange, disabled = false }) => (
  <Box
    bgGradient='to-br'
    gradientFrom='gray.800'
    gradientTo='gray.900'
    borderRadius='2xl'
  >
    <Box
      direction='column'
      gap='8'
      bgGradient='to-br'
      gradientFrom='blue.500/10'
      gradientTo='purple.500/10'
      p={{ base: 3, md: 5 }}
      borderRadius='2xl'
      boxShadow='lg'
    >
      <Heading textAlign='center' fontSize={{ base: 'md', md: 'lg' }} mb={4}>
        {title}
      </Heading>
      <NativeSelect.Root
        size='sm'
        w={{ base: '100%', md: '15rem' }}
        disabled={disabled}
      >
        <NativeSelect.Field
          borderRadius='lg'
          bgGradient='to-r'
          color='black'
          gradientFrom='orange.400'
          gradientTo='orange.500'
          _hover={{ borderColor: '#2e4150' }}
          _focus={{ borderColor: '#2e4150' }}
          borderColor='#782C0F'
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        >
          {options.map(({ value: optValue, label, disabled: optDisabled }) => (
            <option key={optValue} value={optValue} disabled={optDisabled}>
              {label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Box>
  </Box>
));

ConfigSelector.displayName = 'ConfigSelector';

const LoadingScreen = memo(() => (
  <Box
    padding='8'
    borderRadius='2xl'
    display='flex'
    justifyContent='center'
    alignItems='center'
    minH='100vh'
    gradientFrom='cyan.400'
    gradientTo='cyan50'
  >
    <Heading>در حال بارگذاری...</Heading>
  </Box>
));

LoadingScreen.displayName = 'LoadingScreen';

const PartNumberDisplay = memo<{ partNumber: string }>(({ partNumber }) => (
  <Flex
    flexDir='column'
    padding={{ base: '4', md: '8' }}
    borderRadius='3xl'
    gap={4}
    bgGradient='to-r'
    gradientFrom='gray.800'
    gradientTo='gray.700'
    border='2px solid'
    borderColor='gray.500'
    w={{ base: '95%', md: 'auto' }}
    maxW='90vw'
  >
    <Heading size={{ base: 'xl', md: '3xl' }} textAlign='center'>
      پارت نامبر HMI :{' '}
    </Heading>
    <Heading
      bgClip='text'
      bgGradient='to-r'
      gradientFrom='orange.400'
      gradientTo='pink.500'
      fontSize={{ base: 'xl', md: '3xl' }}
      letterSpacing='widest'
      cursor='pointer'
      onClick={() => handleCopy(partNumber)}
      _hover={{ color: '#fbb130' }}
      title='برای کپی کلیک کنید'
      textAlign='center'
      wordBreak='break-all'
    >
      {partNumber}
    </Heading>
  </Flex>
));

PartNumberDisplay.displayName = 'PartNumberDisplay';

PriceDisplay.displayName = 'PriceDisplay';

const DescriptionDisplay = memo<{ description: string }>(({ description }) => (
  <Box
    p={{ base: 3, md: 5 }}
    borderRadius='2xl'
    boxShadow='sm'
    w={{ base: '95%', md: 'auto' }}
    maxW='90vw'
  >
    <Text
      fontWeight='medium'
      textAlign='right'
      whiteSpace='pre-line'
      wordSpacing='2px'
      fontSize={{ base: 'sm', md: 'md' }}
    >
      {description}
    </Text>
  </Box>
));

DescriptionDisplay.displayName = 'DescriptionDisplay';

const AdditionalInfo = memo(() => (
  <Box
    bg='orange.100'
    color='black'
    p={{ base: '3', md: '5' }}
    borderRadius='3xl'
    w={{ base: '95%', md: 'auto' }}
    maxW='90vw'
  >
    <Blockquote.Root colorPalette='cyan' variant='solid' mb={1}>
      <Blockquote.Content fontSize={{ base: 'sm', md: 'md' }}>
        توضیحات تکمیلی: خروجی های ترانزیستوری تا ۵۰ ولت Dc و حداکثر ۵۰۰ میلی
        امپر میباشند. وخروجی های رله تا ۲۵۰ ولت DC/AC و حداکثر ۵ امپر میباشند.
      </Blockquote.Content>
    </Blockquote.Root>

    <Blockquote.Root colorPalette='red' variant='solid'>
      <Blockquote.Content fontSize={{ base: 'sm', md: 'md' }}>
        <Mark variant='text' colorPalette='red' color='red.600'>
          توجه:
        </Mark>{' '}
        حداکثر جریان خروجی مجاز برای هر بلوک 12 آمپر می‌باشد؛ برای مثال در
        دستگاه PACs7070E2 تعداد خروجی در هر بلوک برابر با ۶ عدد است از این رو
        اگر تمام رله ها با هم روشن شوند از هر رله نباید بیش از ۲ آمپر جریان
        کشید.
      </Blockquote.Content>
    </Blockquote.Root>
  </Box>
));

AdditionalInfo.displayName = 'AdditionalInfo';

const HMI = memo<CategoriesProps>(({ selectNewproduct }) => {
  const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG);
  const [, setProducts] = useState<Product[]>([]);
  const [id, setId] = useState(0);
  const [relayNum, setRelayNum] = useState('5');

  const { data, isLoading } = useExcelData();
  const {
    currentPrice,
    currentDescription,
    currentOptions,
    currentPartNumber,
  } = useProductCalculations(config, data, relayNum);
  const { aiOptions, aoOptions } = useConfigOptions(config);

  // Memoized values
  const relayOptions = useMemo(
    () => getRelayOptions(config.size),
    [config.size]
  );
  const sizeOptions = useMemo(
    () =>
      Object.entries(SIZES).map(([key, { display }]) => ({
        value: key,
        label: display,
      })),
    []
  );
  const currentRelayOptions = useMemo(
    () => (config.output === 'T' ? [{ value: '0', label: '0' }] : relayOptions),
    [config.output, relayOptions]
  );

  // Optimized handlers
  const handleConfigChange = useCallback(
    (field: keyof ConfigState, value: string) => {
      setConfig((prev) => {
        const newConfig = { ...prev, [field]: value };

        if (field === 'size') {
          newConfig.ai = '0';
          newConfig.ao = '0';
          setRelayNum(getDefaultRelayNum(value));
          if (value !== '7035E') {
            newConfig.lan = 'L';
          }
        }

        return newConfig;
      });
    },
    []
  );

  const handleAddProduct = useCallback(() => {
    const name = currentPartNumber;

    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === name);

      let newProducts;
      if (existingIndex !== -1) {
        newProducts = [...prev];
        newProducts[existingIndex] = {
          ...newProducts[existingIndex],
          number: newProducts[existingIndex].number + 1,
        };
      } else {
        const newProduct: Product = {
          name,
          id,
          number: 1,
          price: currentPrice,
          description: currentDescription,
          options: currentOptions,
        };
        newProducts = [...prev, newProduct];
        setId((prevId) => prevId + 1);
      }

      selectNewproduct(newProducts);
      return newProducts;
    });
  }, [
    currentPartNumber,
    id,
    currentPrice,
    currentDescription,
    currentOptions,
    selectNewproduct,
  ]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Box
      padding={{ base: '4', md: '8' }}
      borderRadius='2xl'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      gap={{ base: '6', md: '10' }}
      w='100%'
      overflow='hidden'
      direction='rtl'
    >
      <Heading
        size={{ base: '3xl', md: '6xl' }}
        bgClip='text'
        bgGradient='to-r'
        gradientFrom='orange.400'
        gradientTo='pink.500'
        height={{ base: '12', md: '20' }}
        textAlign='center'
      >
        پیکربندی محصولات HMI
      </Heading>

      <PartNumberDisplay partNumber={currentPartNumber} />
      <PriceDisplay price={currentPrice} grFrom='green.600' grTo='green.700' />
      <DescriptionDisplay description={currentDescription} />
      <AdditionalInfo />

      {/* Configuration Grid */}
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={{ base: 2, md: 3 }}
        w={{ base: '95%', md: 'auto' }}
        maxW='90vw'
      >
        <ConfigSelector
          title='اندازه نمایشگر'
          value={config.size}
          options={sizeOptions}
          onChange={(value) => handleConfigChange('size', value)}
        />

        <ConfigSelector
          title='منبع تغذیه'
          value={config.voltage}
          options={VOLTAGE_OPTIONS}
          onChange={(value) => handleConfigChange('voltage', value)}
        />

        <ConfigSelector
          title='نوع خروجی'
          value={config.output}
          options={OUTPUT_OPTIONS}
          onChange={(value) => handleConfigChange('output', value)}
        />

        <ConfigSelector
          title='تعداد خروجی رله'
          value={config.output === 'T' ? '0' : relayNum}
          options={currentRelayOptions}
          onChange={setRelayNum}
          disabled={config.output === 'T'}
        />

        <ConfigSelector
          title='تعداد ورودی آنالوگ'
          value={config.ai}
          options={aiOptions}
          onChange={(value) => handleConfigChange('ai', value)}
        />

        <ConfigSelector
          title='تعداد خروجی آنالوگ'
          value={config.ao}
          options={aoOptions}
          onChange={(value) => handleConfigChange('ao', value)}
        />

        <ConfigSelector
          title='کارت حافظه'
          value={config.sdCard}
          options={SD_CARD_OPTIONS}
          onChange={(value) => handleConfigChange('sdCard', value)}
        />

        <ConfigSelector
          title='پورت اترنت'
          value={config.lan}
          options={LAN_OPTIONS}
          onChange={(value) => handleConfigChange('lan', value)}
          disabled={config.size !== '7035E'}
        />
      </Grid>

      <Button
        bgGradient='to-r'
        gradientFrom='orange.500'
        gradientTo='red.500'
        color='white'
        _hover={{ shadow: '2xl', shadowColor: 'orange.500' }}
        p={{ base: 6, md: 8 }}
        borderRadius='2xl'
        onClick={handleAddProduct}
        w={{ base: '200px', md: 'auto' }}
        fontSize={{ base: 'md', md: 'lg' }}
      >
        تایید
      </Button>
    </Box>
  );
});

HMI.displayName = 'HMI';

export default HMI;
