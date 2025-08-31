import {
  Box,
  Heading,
  Flex,
  Blockquote,
  Mark,
  Grid,
  Button,
  Input,
  Text,
} from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { toaster } from '../../components/ui/toaster';
import type {
  ConfigOption,
  ConfigState,
  Product,
  SizeInfo,
} from '../../interfaces/IHMI';
import {
  useConfigOptions,
  useExcelData,
  useProductCalculations,
} from '../../hooks/customHooks';
import {
  ConfigSelector,
  copyToClipboard,
  getDefaultRelayNum,
  getRelayOptions,
  ProductRow,
} from '../App';

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

function HMI() {
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
      padding={{ base: '4', md: '8' }}
      bgImage='linear-gradient({colors.gray.900}, {colors.blue.900})'
      borderRadius='2xl'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      gap={{ base: '6', md: '10' }}
      minH='100vh'
      w='100%'
      overflow='hidden'
      direction={'rtl'}
    >
      <Heading
        size={{ base: '3xl', md: '6xl' }}
        bgClip={'text'}
        bgGradient={'to-r'}
        gradientFrom={'orange.400'}
        gradientTo={'pink.500'}
        height={{ base: '12', md: '20' }}
        textAlign='center'
      >
        پیکربندی محصولات HMI
      </Heading>

      {/* Part Number Display */}
      <Flex
        flexDir='column'
        padding={{ base: '4', md: '8' }}
        borderRadius={'3xl'}
        gap={4}
        bgGradient={'to-r'}
        gradientFrom={'gray.800'}
        gradientTo={'gray.700'}
        border='2px solid'
        borderColor='gray.500'
        w={{ base: '95%', md: 'auto' }}
        maxW='90vw'
      >
        <Heading size={{ base: 'xl', md: '3xl' }} textAlign='center'>
          پارت نامبر HMI :{' '}
        </Heading>

        <Heading
          bgClip={'text'}
          bgGradient={'to-r'}
          gradientFrom={'orange.400'}
          gradientTo={'pink.500'}
          fontSize={{ base: 'xl', md: '3xl' }}
          letterSpacing='widest'
          cursor='pointer'
          onClick={() => handleCopy(currentPartNumber)}
          _hover={{ color: '#fbb130' }}
          title='برای کپی کلیک کنید'
          textAlign='center'
          wordBreak='break-all'
        >
          {currentPartNumber}
        </Heading>
      </Flex>

      {/* Price Display */}
      <Box
        p={{ base: 6, md: 10 }}
        borderRadius='2xl'
        boxShadow='sm'
        bgGradient={'to-r'}
        gradientFrom={'green.600'}
        gradientTo={'green.700'}
        w={{ base: '95%', md: 'auto' }}
      >
        <Heading
          _hover={{
            color: '#fbb130',
          }}
          size={{ base: 'xl', md: '2xl' }}
          cursor='pointer'
          onClick={() => handleCopy(currentPrice.toLocaleString())}
          textAlign='center'
        >
          {currentPrice.toLocaleString()} ریال
        </Heading>
      </Box>

      {/* Description Display */}
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
          wordSpacing={'2px'}
          fontSize={{ base: 'sm', md: 'md' }}
        >
          {currentDescription}
        </Text>
      </Box>

      <Box
        bg={'orange.100'}
        color={'black'}
        p={{ base: '3', md: '5' }}
        borderRadius={'3xl'}
        w={{ base: '95%', md: 'auto' }}
        maxW='90vw'
      >
        <Blockquote.Root colorPalette={'cyan'} variant={'solid'} mb={1}>
          <Blockquote.Content fontSize={{ base: 'sm', md: 'md' }}>
            توضیحات تکمیلی: خروجی های ترانزیستوری تا ۵۰ ولت Dc و حداکثر ۵۰۰ میلی
            امپر میباشند. وخروجی های رله تا ۲۵۰ ولت DC/AC و حداکثر ۵ امپر
            میباشند.
          </Blockquote.Content>
        </Blockquote.Root>

        <Blockquote.Root colorPalette={'red'} variant={'solid'}>
          <Blockquote.Content fontSize={{ base: 'sm', md: 'md' }}>
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
        p={{ base: 6, md: 8 }}
        borderRadius='2xl'
        onClick={handleAddProduct}
        w={{ base: '200px', md: 'auto' }}
        fontSize={{ base: 'md', md: 'lg' }}
      >
        تایید
      </Button>

      {/* Products List */}
      <Box
        p={{ base: '6', md: '12' }}
        borderRadius='2xl'
        border={' 1px solid'}
        shadow={'lg'}
        borderColor={'whiteAlpha.400'}
        w={{ base: '95%', md: '50rem' }}
        maxW='90vw'
        display='flex'
        flexDirection='column'
        gap={{ base: '6', md: '10' }}
        justifyContent='center'
        alignItems='center'
        bg='rgba(255, 255, 255, 0.100)'
        backdropBlur={'3xl'}
      >
        <Heading size={{ base: 'xl', md: '3xl' }} textAlign='center'>
          محصولات انتخاب شده
        </Heading>

        {products.length > 0 ? (
          <Flex direction={'column'} gap={'5'} w='100%'>
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
            <Heading size={{ base: '4xl', md: '6xl' }}>📦</Heading>
            <Heading textAlign='center' fontSize={{ base: 'lg', md: 'xl' }}>
              محصولی اضافه نشده
            </Heading>
          </Flex>
        )}
      </Box>

      {/* Total Price */}
      {products.length > 0 && (
        <Box
          p={{ base: '8', md: '12' }}
          borderRadius='2xl'
          boxShadow='lg'
          w={{ base: '95%', md: '40rem' }}
          maxW='90vw'
          bgGradient={'to-r'}
          gradientFrom={'purple.600'}
          gradientTo={'cyan.600'}
        >
          <Heading size={{ base: 'xl', md: '3xl' }} mb={'4'} textAlign='center'>
            قیمت کل
          </Heading>
          <Heading
            _hover={{ color: '#fbb130' }}
            cursor='pointer'
            onClick={() => handleCopy(totalPrice.toLocaleString())}
            size={{ base: '2xl', md: '4xl' }}
            textAlign='center'
            wordBreak='break-all'
          >
            {totalPrice.toLocaleString()} ریال
          </Heading>
        </Box>
      )}

      {/* Customer Information */}
      <Box
        p={{ base: '6', md: '12' }}
        borderRadius='2xl'
        border={' 1px solid'}
        shadow={'lg'}
        borderColor={'whiteAlpha.400'}
        w={{ base: '95%', md: '35rem' }}
        maxW='90vw'
        display='flex'
        flexDirection='column'
        gap={{ base: '8', md: '12' }}
        alignItems='center'
        bg='rgba(255, 255, 255, 0.100)'
        backdropBlur={'3xl'}
      >
        <Heading size={{ base: 'xl', md: '2xl' }} textAlign='center'>
          اطلاعات مشتری
        </Heading>
        <Flex gap={'4'} direction={'column'} alignItems={'center'} w='100%'>
          <Flex
            mb={{ base: '6', md: '12' }}
            direction='column'
            alignItems='start'
            w='100%'
          >
            <Heading mb='5' size={{ base: 'md', md: 'lg' }} px={3}>
              نام و نام خانوادگی
            </Heading>
            <Input
              size='md'
              bg={'whiteAlpha.200'}
              w='100%'
              borderRadius='lg'
              border='solid 1px'
              borderColor={'white/30'}
              value={customerName}
              onChange={(e) => setCustomerName(e.currentTarget.value)}
            />
          </Flex>

          <Flex
            mb={{ base: '6', md: '12' }}
            justify='center'
            direction='column'
            alignItems='start'
            w='100%'
          >
            <Heading mb='5' size={{ base: 'md', md: 'lg' }} px={3}>
              نام شرکت/ زمینه کاری
            </Heading>
            <Input
              size='md'
              bg={'whiteAlpha.200'}
              w='100%'
              borderRadius='lg'
              border='solid 1px'
              borderColor={'white/30'}
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.currentTarget.value)}
            />
          </Flex>
          <Flex direction={'column'} align={'center'} w='100%'>
            <Button
              onClick={handleSendMessage}
              bgGradient={'to-r'}
              gradientFrom={'green.500'}
              gradientTo={'green.600'}
              w={{ base: '100%', md: '13rem' }}
              color='white'
              py={{ base: 4, md: 6 }}
              px={{ base: 6, md: 8 }}
              borderRadius='xl'
              fontSize={{ base: 'md', md: 'lg' }}
            >
              ارسال در واتس اپ
            </Button>
            <Heading
              mt='5'
              textStyle='md'
              size={{ base: 'sm', md: 'lg' }}
              color={'whiteAlpha.700'}
              textAlign='center'
              px={2}
            >
              قبل از ارسال پیام، در حساب واتس اپ خود لاگین باشید
            </Heading>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
export default HMI;
