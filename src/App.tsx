import {
  Box,
  Button,
  CloseButton,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  NumberInput,
  Popover,
  Table,
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

const RELAY_CONFIG = [
  { size: '7035E', options: ['5'] },
  { size: '7070E2', options: ['12', '6'] },
  { size: '7101E', options: ['20', '15', '10', '5'] },
];

// Utility functions
const copyToClipboard = (text: string): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => navigator.clipboard.writeText(text));
  } else {
    setTimeout(() => navigator.clipboard.writeText(text), 0);
  }
};

const loadExcelData = async (): Promise<FileData[]> => {
  const response = await fetch('/data.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

const generateRange = (max: number): ConfigOption[] =>
  Array.from({ length: max + 1 }, (_, i) => ({
    value: i.toString(),
    label: i.toString(),
  }));

// Memoized Components
const ConfigSelector = memo<{
  title: string;
  value: string;
  options: ConfigOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}>(({ title, value, options, onChange, disabled = false }) => (
  <Box
    direction='column'
    gap='8'
    bg='##0f1b24'
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
        bg='#fbb130'
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
));

ConfigSelector.displayName = 'ConfigSelector';

const ProductRow = memo<{
  product: Product;
  index: number;
  onCopy: (text: string) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (id: number) => void;
}>(({ product, index, onCopy, onUpdateQuantity, onRemove }) => (
  <Table.Row background='#F5F6F6'>
    <Table.Cell>
      <Flex gap='5'>
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
      </Flex>
    </Table.Cell>
    <Table.Cell>
      <NumberInput.Root
        width='70px'
        defaultValue={product.number.toString()}
        min={1}
        value={product.number.toString()}
        onValueChange={(e) => onUpdateQuantity(index, parseInt(e.value) || 1)}
      >
        <NumberInput.Control>
          <NumberInput.IncrementTrigger _hover={{ background: '#de7525' }} />
          <NumberInput.DecrementTrigger _hover={{ background: '#de7525' }} />
        </NumberInput.Control>
        <NumberInput.Input
          border='none'
          _hover={{ border: 'none' }}
          backgroundColor='#de6407'
          color='white'
        />
      </NumberInput.Root>
    </Table.Cell>
    <Table.Cell>
      <Flex gap='8'>
        <Heading
          _hover={{ color: '#fbb130' }}
          cursor='pointer'
          onClick={() =>
            onCopy((product.price * product.number).toLocaleString())
          }
        >
          {(product.price * product.number).toLocaleString()} ریال
        </Heading>
        <CloseButton
          _hover={{ background: '#f9130bf' }}
          onClick={() => onRemove(product.id)}
          size='2xs'
          variant='ghost'
          background='#fffffff8f'
          borderRadius='full'
        />
      </Flex>
    </Table.Cell>
  </Table.Row>
));

ProductRow.displayName = 'ProductRow';

// Custom Hooks
const useExcelData = () => {
  const [data, setData] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadExcelData()
      .then((jsonData) => {
        if (isMounted) {
          setData(jsonData);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
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
    const relayPrice = data[7]?.price || 0;

    if (config.output === 'R') {
      extra += relayPrice * parseInt(relayNum);
    }

    extra += (data[5]?.price || 0) * parseInt(config.ai);
    extra += (data[6]?.price || 0) * parseInt(config.ao);

    if (config.sdCard === 'S') {
      extra += data[3]?.price || 0;
    }

    if (config.size === '7035E' && config.lan === 'L') {
      extra += data[4]?.price || 0;
    }

    return extra;
  }, [config, data, relayNum]);

  const currentPrice = useMemo(
    () => (currentPac?.price || 0) + priceExtras,
    [currentPac?.price, priceExtras]
  );

  const currentDescription = useMemo(() => {
    if (!currentPac) return '';

    const sizeInfo = SIZES[config.size as keyof typeof SIZES];
    const outputNumber = sizeInfo?.outputs || 5;

    const parts = [
      'آپشن ها:',
      config.voltage === 'AC' ? 'تغذیه 220 ولت AC' : 'منبع تغذیه 24 ولت DC',
      config.output === 'T'
        ? `دارای ${outputNumber} عدد خروجی ترانزیستوری`
        : `دارای ${outputNumber} عدد خروجی رله‌ای`,
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
  }, [currentPac, config]);

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
  const analogOptions = useMemo(() => {
    const sizeInfo = SIZES[config.size as keyof typeof SIZES];
    const maxTotal = sizeInfo?.maxAnalog || 2;
    const aiNum = parseInt(config.ai);
    const aoNum = parseInt(config.ao);

    const aiOptions = generateRange(4).map((option) => ({
      ...option,
      disabled:
        parseInt(option.value) + aoNum > maxTotal ||
        (config.size === '7035E' && parseInt(option.value) > 2),
    }));

    const aoOptions = generateRange(4).map((option) => ({
      ...option,
      disabled:
        aiNum + parseInt(option.value) > maxTotal ||
        (config.size === '7035E' && parseInt(option.value) > 2),
    }));

    return { aiOptions, aoOptions };
  }, [config.size, config.ai, config.ao]);

  const relayOptions = useMemo(() => {
    const selectedOptions = RELAY_CONFIG.find(
      (option) => option.size === config.size
    );
    return (
      selectedOptions?.options.map((selected) => ({
        value: selected,
        label: selected,
      })) || []
    );
  }, [config.size]);

  return { analogOptions, relayOptions };
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
  const { analogOptions, relayOptions } = useConfigOptions(config);

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
          setRelayNum(
            value === '7035E' ? '5' : value === '7070E2' ? '12' : '20'
          );
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
        bg='#F5F6F6'
        borderRadius='2xl'
        display='flex'
        justifyContent='center'
        alignItems='center'
        minH='100vh'
      >
        <Heading>در حال بارگذاری...</Heading>
      </Box>
    );
  }

  return (
    <Box
      padding='8'
      bg='#F5F6F6'
      borderRadius='2xl'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      gap='3'
    >
      <Toaster />

      {/* Part Number Display */}
      <Flex flexDir='row' gap={4}>
        <Heading size='3xl'>پارت نامبر HMI : </Heading>
        <Flex align='center'>
          <Heading
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
      </Flex>

      {/* Price Display */}
      <Box bg='##0f1b24' p={4} borderRadius='2xl' boxShadow='sm'>
        <Heading
          _hover={{ color: '#fbb130' }}
          cursor='pointer'
          onClick={() => handleCopy(currentPrice.toLocaleString())}
        >
          {currentPrice.toLocaleString()} ریال
        </Heading>
      </Box>

      {/* Description Display */}
      <Box bg='##0f1b24' p={5} borderRadius='2xl' boxShadow='sm'>
        <Text fontWeight='medium' textAlign='right' whiteSpace='pre-line'>
          {currentDescription}
        </Text>
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
          options={analogOptions.aiOptions}
          onChange={(value) => handleConfigChange('ai', value)}
        />

        <ConfigSelector
          title='تعداد خروجی آنالوگ'
          value={config.ao}
          options={analogOptions.aoOptions}
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
        bg='#de6407'
        color='white'
        _hover={{ bg: '#de7525' }}
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
        boxShadow='lg'
        w='50rem'
        display='flex'
        flexDirection='column'
        gap='4'
        justifyContent='center'
        alignItems='center'
      >
        <Heading size='xl'>محصولات انتخاب شده</Heading>

        {products.length > 0 ? (
          <Table.Root background='white' direction='ltr'>
            <Table.Body>
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
            </Table.Body>
          </Table.Root>
        ) : (
          <Heading textAlign='center' fontSize='lg'>
            محصولی اضافه نشده
          </Heading>
        )}
      </Box>

      {/* Total Price */}
      <Box bg='##0f1b24' p={12} borderRadius='2xl' boxShadow='lg' w='40rem'>
        <Heading size='xl'>قیمت کل</Heading>
        <Heading
          _hover={{ color: '#fbb130' }}
          cursor='pointer'
          onClick={() => handleCopy(totalPrice.toLocaleString())}
        >
          {totalPrice.toLocaleString()} ریال
        </Heading>
      </Box>

      {/* Customer Information */}
      <Box bg='##0f1b24' p={12} borderRadius='2xl' boxShadow='lg' w='40rem'>
        <Flex justify='center' mb='12' direction='column' alignItems='center'>
          <Heading mb='5' size='xl'>
            نام و نام خانوادگی
          </Heading>
          <Input
            size='md'
            w='20rem'
            borderRadius='lg'
            border='#782C0F solid 2px'
            value={customerName}
            onChange={(e) => setCustomerName(e.currentTarget.value)}
          />
        </Flex>

        <Flex mb='12' justify='center' direction='column' alignItems='center'>
          <Heading mb='5' size='xl'>
            نام شرکت/ زمینه کاری
          </Heading>
          <Input
            size='md'
            w='20rem'
            borderRadius='lg'
            border='#782C0F solid 2px'
            value={customerCompany}
            onChange={(e) => setCustomerCompany(e.currentTarget.value)}
          />
        </Flex>

        <Button
          onClick={handleSendMessage}
          bg='#1c8e37'
          color='white'
          _hover={{ bg: '#20b943' }}
          p={8}
          borderRadius='2xl'
        >
          ارسال در واتس اپ
        </Button>
        <Heading mt='5' textStyle='md' size='lg'>
          قبل از ارسال پیام، در حساب واتس اپ خود لاگین باشید
        </Heading>
      </Box>
    </Box>
  );
}

export default App;
