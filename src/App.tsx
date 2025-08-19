import {
  Blockquote,
  Box,
  Button,
  CloseButton,
  Flex,
  Grid,
  Heading,
  Input,
  Mark,
  NativeSelect,
  NumberInput,
  Popover,
  Text,
} from '@chakra-ui/react';
import './App.css';
import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import * as XLSX from 'xlsx';
import { Toaster, toaster } from './components/ui/toaster';

// Types
interface Product {
  id: number;
  name: string;
  number: number;
  price: number;
  description: string;
  options: string;
}

interface FileData {
  name: string;
  price: number;
  description: string;
}

interface ConfigState {
  size: string;
  voltage: string;
  output: string;
  ai: string;
  ao: string;
  sdCard: string;
  lan: string;
}

interface SizeInfo {
  display: string;
  outputs: number;
  maxAnalog: number;
  relay: number[];
}

interface ConfigOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Constants
const SIZES: Record<string, SizeInfo> = {
  '7035E': { display: '3.5 اینچ', outputs: 5, maxAnalog: 2, relay: [5] },
  '7070E2': { display: '7 اینچ', outputs: 12, maxAnalog: 3, relay: [12, 6] },
  '7101E': {
    display: '10 اینچ',
    outputs: 20,
    maxAnalog: 4,
    relay: [20, 15, 10, 5],
  },
} as const;

const VOLTAGE_OPTIONS: ConfigOption[] = [
  { value: 'DC', label: '24V DC تغذیه' },
  { value: 'AC', label: '220V AC تغذیه' },
];

const OUTPUT_OPTIONS: ConfigOption[] = [
  { value: 'T', label: 'خروجی ترانزیستوری' },
  { value: 'R', label: 'خروجی رله ای' },
];

const SD_CARD_OPTIONS: ConfigOption[] = [
  { value: 'S', label: 'دارد' },
  { value: 'N', label: 'ندارد' },
];

const LAN_OPTIONS: ConfigOption[] = [
  { value: 'L', label: 'دارد' },
  { value: 'N', label: 'ندارد' },
];

const INITIAL_CONFIG: ConfigState = {
  size: '7035E',
  voltage: 'AC',
  output: 'T',
  ai: '0',
  ao: '0',
  sdCard: 'N',
  lan: 'L',
};

// Utility functions
const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

const loadExcelData = async (): Promise<FileData[]> => {
  try {
    const response = await fetch('/data.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Error loading Excel data:', error);
    return [];
  }
};

const generateRange = (max: number): ConfigOption[] =>
  Array.from({ length: max + 1 }, (_, i) => ({
    value: i.toString(),
    label: i.toString(),
  }));

const getRelayOptions = (size: string): ConfigOption[] => {
  const sizeInfo = SIZES[size];
  return (
    sizeInfo?.relay.map((value) => ({
      value: value.toString(),
      label: value.toString(),
    })) || []
  );
};

const getDefaultRelayNum = (size: string): string => {
  const sizeInfo = SIZES[size];
  return sizeInfo?.relay[0]?.toString() || '5';
};

// Memoized Components
const ConfigSelector = memo<{
  title: string;
  value: string;
  options: ConfigOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}>(({ title, value, options, onChange, disabled = false }) => (
  <Box
    bgGradient={'to-br'}
    gradientFrom={'gray.800'}
    gradientTo={'gray.900'}
    borderRadius='2xl'
  >
    <Box
      direction='column'
      gap='8'
      bgGradient={'to-br'}
      gradientFrom={'blue.500/10'}
      gradientTo={'purple.500/10'}
      p={5}
      borderRadius='2xl'
      boxShadow='lg'
    >
      <Heading textAlign='center' fontSize='lg' mb={6}>
        {title}
      </Heading>
      <NativeSelect.Root size='sm' w='15rem' disabled={disabled}>
        <NativeSelect.Field
          borderRadius='lg'
          bgGradient={'to-r'}
          color={'white'}
          gradientFrom={'orange.400'}
          gradientTo={'orange.500'}
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

const ProductRow = memo<{
  product: Product;
  index: number;
  onCopy: (text: string) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (id: number) => void;
}>(({ product, index, onCopy, onUpdateQuantity, onRemove }) => (
  <Flex
    padding={'5'}
    background='white'
    borderRadius={'3xl'}
    shadow={'2xl'}
    border={'1px solid'}
    borderColor={'gray.200'}
    _hover={{ shadow: 'xl' }}
    gap={'4'}
    color={'black'}
    direction={'row-reverse'}
    alignItems={'center'}
  >
    <Popover.Root positioning={{ placement: 'bottom-end' }}>
      <Popover.Trigger asChild>
        <Button
          size='sm'
          color='cyan.600'
          variant='solid'
          borderRadius='full'
          background='cyan.200'
        >
          ?
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content background='white' borderRadius='xl'>
          <Popover.Arrow>
            <Popover.ArrowTip background='white!' border='none' />
          </Popover.Arrow>
          <Popover.Body background='white' borderRadius='xl'>
            <Popover.Title fontSize='xl'>مشخصات محصول</Popover.Title>
            <Text my='4' textAlign='right'>
              {product.description}
            </Text>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
    <Heading
      textAlign='center'
      fontSize='lg'
      letterSpacing='widest'
      _hover={{ color: '#fbb130' }}
      cursor='pointer'
      onClick={() => onCopy(product.name)}
    >
      {product.name}
    </Heading>

    <NumberInput.Root
      defaultValue={product.number.toString()}
      min={1}
      max={99}
      value={product.number.toString()}
      onValueChange={(e) => onUpdateQuantity(index, parseInt(e.value) || 1)}
    >
      <Flex gap={'1'} alignItems={'center'}>
        <Button
          onClick={() => onUpdateQuantity(index, product.number - 1)}
          backgroundGradient={'to-r'}
          gradientFrom={'red.500'}
          gradientTo={'red.600'}
          fontSize={'2xl'}
          color={'white'}
        >
          -
        </Button>
        <NumberInput.Input
          maxWidth={'30px'}
          min={1}
          max={99}
          border='none'
          _hover={{ border: 'none' }}
          backgroundColor='#de6407'
          color='white'
          textAlign={'center'}
        />
        <Button
          onClick={() => onUpdateQuantity(index, product.number + 1)}
          backgroundGradient={'to-r'}
          gradientFrom={'green.500'}
          gradientTo={'green.600'}
          fontSize={'lg'}
          color={'white'}
        >
          +
        </Button>
      </Flex>
    </NumberInput.Root>

    <Heading
      _hover={{ color: '#fbb130' }}
      cursor='pointer'
      onClick={() => onCopy((product.price * product.number).toLocaleString())}
    >
      {(product.price * product.number).toLocaleString()} ریال
    </Heading>
    <CloseButton
      _hover={{ background: '#f9130bf' }}
      onClick={() => onRemove(product.id)}
      size='2xs'
      background='red.300'
      color={'red.500'}
      borderRadius='full'
    />
  </Flex>
));

// Custom Hooks
const useExcelData = () => {
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

const useProductCalculations = (
  config: ConfigState,
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
    const parts = [
      `Power: ${config.voltage}`,
      `Output: ${config.output}`,
      `AI: ${config.ai}`,
      `AO: ${config.ao}`,
      `SD: ${config.sdCard}`,
    ];

    if (config.size === '7035E') {
      parts.push(`Lan: ${config.lan}`);
    }

    return parts.join('\n         ');
  }, [config]);

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

const useConfigOptions = (config: ConfigState) => {
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

// Main Component
function App() {
  const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG);
  const [products, setProducts] = useState<Product[]>([]);
  const [id, setId] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [relayNum, setRelayNum] = useState('5');

  const { data, isLoading } = useExcelData();
  const {
    currentPrice,
    currentDescription,
    currentOptions,
    currentPartNumber,
  } = useProductCalculations(config, data, relayNum);
  const { aiOptions, aoOptions } = useConfigOptions(config);

  const relayOptions = useMemo(
    () => getRelayOptions(config.size),
    [config.size]
  );

  const totalPrice = useMemo(
    () => products.reduce((sum, item) => sum + item.price * item.number, 0),
    [products]
  );

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

  const handleCopy = useCallback(copyToClipboard, []);

  const handleAddProduct = useCallback(() => {
    const name = currentPartNumber;

    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.name === name);

      if (existingIndex !== -1) {
        const newProducts = [...prev];
        newProducts[existingIndex] = {
          ...newProducts[existingIndex],
          number: newProducts[existingIndex].number + 1,
        };
        return newProducts;
      }

      const newProduct: Product = {
        name,
        id,
        number: 1,
        price: currentPrice,
        description: currentDescription,
        options: currentOptions,
      };

      setId((prevId) => prevId + 1);
      return [...prev, newProduct];
    });
  }, [currentPartNumber, id, currentPrice, currentDescription, currentOptions]);

  const handleRemoveProduct = useCallback((productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const handleUpdateProductQuantity = useCallback(
    (index: number, quantity: number) => {
      if (quantity < 1) return;

      setProducts((prev) => {
        const newProducts = [...prev];
        newProducts[index] = { ...newProducts[index], number: quantity };
        return newProducts;
      });
    },
    []
  );

  const handleSendMessage = useCallback(() => {
    const trimmedName = customerName.trim();
    const trimmedCompany = customerCompany.trim();

    if (!trimmedCompany || !trimmedName) {
      toaster.create({
        description: 'لطفا مشخصات مورد نیاز را وارد نمایید',
        type: 'Error',
      });
      return;
    }

    if (products.length === 0) return;

    const productsText = products
      .map(
        (p) =>
          `${p.name} ${p.options} \n      X ${p.number} \n     --------------------- \n `
      )
      .join('');

    const message = `سلام وقت بخیر\n${trimmedName} هستم از شرکت ${trimmedCompany}\n${productsText}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/+989196040485?text=${encodedMessage}`;

    window.open(url, '_blank');
  }, [customerName, customerCompany, products]);

  if (isLoading) {
    return (
      <Box
        padding='8'
        borderRadius='2xl'
        display='flex'
        justifyContent='center'
        alignItems='center'
        minH='100vh'
        gradientFrom={'cyan.400'}
        gradientTo={'cyan50'}
      >
        <Heading>در حال بارگذاری...</Heading>
      </Box>
    );
  }

  return (
    <Box
      padding='8'
      bgImage='linear-gradient({colors.gray.900}, {colors.blue.900})'
      borderRadius='2xl'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      gap='10'
    >
      <Toaster />
      <Heading
        size={'6xl'}
        bgClip={'text'}
        bgGradient={'to-r'}
        gradientFrom={'orange.400'}
        gradientTo={'pink.500'}
        height={'20'}
      >
        پیکربندی محصولات HMI
      </Heading>
      {/* Part Number Display */}
      <Flex
        flexDir='column'
        padding={'8'}
        borderRadius={'3xl'}
        gap={4}
        bgGradient={'to-r'}
        gradientFrom={'gray.800'}
        gradientTo={'gray.700'}
        border='2px solid'
        borderColor='gray.500'
      >
        <Heading size='3xl'>پارت نامبر HMI : </Heading>

        <Heading
          bgClip={'text'}
          bgGradient={'to-r'}
          gradientFrom={'orange.400'}
          gradientTo={'pink.500'}
          fontSize='3xl'
          letterSpacing='widest'
          cursor='pointer'
          onClick={() => handleCopy(currentPartNumber)}
          _hover={{ color: '#fbb130' }}
          title='برای کپی کلیک کنید'
        >
          {currentPartNumber}
        </Heading>
      </Flex>

      {/* Price Display */}
      <Box
        p={10}
        borderRadius='2xl'
        boxShadow='sm'
        bgGradient={'to-r'}
        gradientFrom={'green.600'}
        gradientTo={'green.700'}
      >
        <Heading
          _hover={{
            color: '#fbb130',
            //  bgGradient: 'to-r',
            // gradientFrom: 'orange.400',
            // gradientTo: 'pink.500',
            // bgClip: 'text',
          }}
          size={'2xl'}
          cursor='pointer'
          onClick={() => handleCopy(currentPrice.toLocaleString())}
        >
          {currentPrice.toLocaleString()} ریال
        </Heading>
      </Box>

      {/* Description Display */}
      <Box p={5} borderRadius='2xl' boxShadow='sm'>
        <Text
          fontWeight='medium'
          textAlign='right'
          whiteSpace='pre-line'
          wordSpacing={'2px'}
        >
          {currentDescription}
        </Text>
      </Box>
      <Box bg={'orange.100'} color={'black'} p={'5'} borderRadius={'3xl'}>
        <Blockquote.Root colorPalette={'cyan'} variant={'solid'} mb={1}>
          <Blockquote.Content>
            توضیحات تکمیلی: خروجی های ترانزیستوری تا ۵۰ ولت Dc و حداکثر ۵۰۰ میلی
            امپر میباشند. وخروجی های رله تا ۲۵۰ ولت DC/AC و حداکثر ۵ امپر
            میباشند.
          </Blockquote.Content>
        </Blockquote.Root>

        <Blockquote.Root colorPalette={'red'} variant={'solid'}>
          <Blockquote.Content>
            <Mark variant={'text'} colorPalette={'red'} color={'red.600'}>
              توجه:
            </Mark>{' '}
            حداکثر جریان خروجی مجاز برای هر بلوک 12 آمپر می‌باشد؛ برای مثال در
            دستگاه PACs7070E2 تعداد خروجی در هر بلوک برابر با ۶ عدد است از این
            رو اگر تمام رله ها با هم روشن شوند از هر رله نباید بیش از ۲ آمپر
            جریان کشید.
          </Blockquote.Content>
        </Blockquote.Root>
      </Box>

      {/* Configuration Grid */}
      <Grid templateColumns={{ base: '2fr', md: 'repeat(4, 1fr)' }} gap={3}>
        <ConfigSelector
          title='اندازه نمایشگر'
          value={config.size}
          options={Object.entries(SIZES).map(([key, { display }]) => ({
            value: key,
            label: display,
          }))}
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
          options={
            config.output === 'T' ? [{ value: '0', label: '0' }] : relayOptions
          }
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
        bgGradient={'to-r'}
        gradientFrom={'orange.500'}
        gradientTo={'red.500'}
        color='white'
        _hover={{ shadow: '2xl', shadowColor: 'orange.500' }}
        p={8}
        borderRadius='2xl'
        onClick={handleAddProduct}
      >
        تایید
      </Button>

      {/* Products List */}
      <Box
        p={12}
        borderRadius='2xl'
        border={' 1px solid'}
        shadow={'lg'}
        borderColor={'whiteAlpha.400'}
        w='50rem'
        display='flex'
        flexDirection='column'
        gap='10'
        justifyContent='center'
        alignItems='center'
        bg='rgba(255, 255, 255, 0.100)'
        backdropBlur={'3xl'}
      >
        <Heading size='3xl'>محصولات انتخاب شده</Heading>

        {products.length > 0 ? (
          <Flex direction={'column'} gap={'5'}>
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
                onCopy={handleCopy}
                onUpdateQuantity={handleUpdateProductQuantity}
                onRemove={handleRemoveProduct}
              />
            ))}
          </Flex>
        ) : (
          <Flex direction={'column'} gap={'10'}>
            <Heading size={'6xl'}>📦</Heading>
            <Heading textAlign='center' fontSize='xl'>
              محصولی اضافه نشده
            </Heading>
          </Flex>
        )}
      </Box>

      {/* Total Price */}
      {products.length > 0 && (
        <Box
          p={12}
          borderRadius='2xl'
          boxShadow='lg'
          w='40rem'
          bgGradient={'to-r'}
          gradientFrom={'purple.600'}
          gradientTo={'cyan.600'}
        >
          <Heading size='3xl' mb={'4'}>
            قیمت کل
          </Heading>
          <Heading
            _hover={{ color: '#fbb130' }}
            cursor='pointer'
            onClick={() => handleCopy(totalPrice.toLocaleString())}
            size={'4xl'}
          >
            {totalPrice.toLocaleString()} ریال
          </Heading>
        </Box>
      )}
      {/* Customer Information */}
      <Box
        p={12}
        borderRadius='2xl'
        border={' 1px solid'}
        shadow={'lg'}
        borderColor={'whiteAlpha.400'}
        w='35rem'
        display='flex'
        flexDirection='column'
        gap='12'
        alignItems='center'
        bg='rgba(255, 255, 255, 0.100)'
        backdropBlur={'3xl'}
      >
        <Heading size={'2xl'}>اطلاعات مشتری</Heading>
        <Flex gap={'4'} direction={'column'} alignItems={'center'}>
          <Flex mb='12' direction='column' alignItems='start'>
            <Heading mb='5' size='lg' px={3}>
              نام و نام خانوادگی
            </Heading>
            <Input
              size='md'
              bg={'whiteAlpha.200'}
              w='30rem'
              borderRadius='lg'
              border='solid 1px'
              borderColor={'white/30'}
              value={customerName}
              onChange={(e) => setCustomerName(e.currentTarget.value)}
            />
          </Flex>

          <Flex mb='12' justify='center' direction='column' alignItems='start'>
            <Heading mb='5' size='lg' px={3}>
              نام شرکت/ زمینه کاری
            </Heading>
            <Input
              size='md'
              bg={'whiteAlpha.200'}
              w='30rem'
              borderRadius='lg'
              border='solid 1px'
              borderColor={'white/30'}
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.currentTarget.value)}
            />
          </Flex>
          <Flex direction={'column'} align={'center'}>
            <Button
              onClick={handleSendMessage}
              bgGradient={'to-r'}
              gradientFrom={'green.500'}
              gradientTo={'green.600'}
              maxW={'13rem'}
              color='white'
              py={6}
              px={8}
              borderRadius='xl'
            >
              ارسال در واتس اپ
            </Button>
            <Heading mt='5' textStyle='md' size='lg' color={'whiteAlpha.700'}>
              قبل از ارسال پیام، در حساب واتس اپ خود لاگین باشید
            </Heading>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

export default App;
