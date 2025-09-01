import { Box, Button, Flex, Heading, Input, Tabs } from '@chakra-ui/react';
import '../styles/App.css';
import { useCallback, useMemo, useState, memo } from 'react';
import type { Product } from '../interfaces/IHMI';
import HMI from './tabContents/HMI';
import { toaster } from '../components/ui/toaster';
import { handleCopy } from './features/UtilityFunctions';
import { ProductRow } from './sections/ProductRow';
import PLC from './tabContents/PLC';

// Constants
const WHATSAPP_NUMBER = '+989196040485';

// Memoized components
const EmptyProductsState = memo(() => (
  <Flex direction='column' gap='10'>
    <Heading size={{ base: '4xl', md: '6xl' }}>📦</Heading>
    <Heading textAlign='center' fontSize={{ base: 'lg', md: 'xl' }}>
      محصولی اضافه نشده
    </Heading>
  </Flex>
));

EmptyProductsState.displayName = 'EmptyProductsState';

const ProductsList = memo<{
  products: Product[];
  onCopy: (text: string) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}>(({ products, onCopy, onUpdateQuantity, onRemove }) => (
  <Box
    p={{ base: '6', md: '12' }}
    borderRadius='2xl'
    border='1px solid'
    shadow='lg'
    borderColor='whiteAlpha.400'
    w={{ base: '95%', md: '50rem' }}
    display='flex'
    flexDirection='column'
    gap={{ base: '6', md: '10' }}
    justifyContent='center'
    alignItems='center'
    bg='rgba(255, 255, 255, 0.100)'
    backdropBlur='3xl'
  >
    <Heading size={{ base: 'xl', md: '3xl' }} textAlign='center'>
      محصولات انتخاب شده
    </Heading>

    {products.length > 0 ? (
      <Flex direction='column' gap='5' w='100%'>
        {products.map((product, index) => (
          <ProductRow
            key={product.id}
            product={product}
            index={index}
            onCopy={onCopy}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </Flex>
    ) : (
      <EmptyProductsState />
    )}
  </Box>
));

ProductsList.displayName = 'ProductsList';

const TotalPriceDisplay = memo<{
  totalPrice: number;
  onCopy: (text: string) => void;
}>(({ totalPrice, onCopy }) => (
  <Box
    p={{ base: '8', md: '12' }}
    borderRadius='2xl'
    boxShadow='lg'
    w={{ base: '95%', md: '40rem' }}
    maxW='90vw'
    bgGradient='to-r'
    gradientFrom='purple.600'
    gradientTo='cyan.600'
  >
    <Heading size={{ base: 'xl', md: '3xl' }} mb='4' textAlign='center'>
      قیمت کل
    </Heading>
    <Heading
      _hover={{ color: '#fbb130' }}
      cursor='pointer'
      onClick={() => onCopy(totalPrice.toLocaleString())}
      size={{ base: '2xl', md: '4xl' }}
      textAlign='center'
      wordBreak='break-all'
    >
      {totalPrice.toLocaleString()} ریال
    </Heading>
  </Box>
));

TotalPriceDisplay.displayName = 'TotalPriceDisplay';

const CustomerForm = memo<{
  customerName: string;
  customerCompany: string;
  onNameChange: (name: string) => void;
  onCompanyChange: (company: string) => void;
  onSubmit: () => void;
}>(
  ({
    customerName,
    customerCompany,
    onNameChange,
    onCompanyChange,
    onSubmit,
  }) => (
    <Box
      p={{ base: '6', md: '12' }}
      borderRadius='2xl'
      border='1px solid'
      shadow='lg'
      borderColor='whiteAlpha.400'
      w={{ base: '95%', md: '35rem' }}
      maxW='90vw'
      display='flex'
      flexDirection='column'
      gap={{ base: '8', md: '12' }}
      alignItems='center'
      bg='rgba(255, 255, 255, 0.100)'
      backdropBlur='3xl'
    >
      <Heading size={{ base: 'xl', md: '2xl' }} textAlign='center'>
        اطلاعات مشتری
      </Heading>

      <Flex gap='4' direction='column' alignItems='center' w='100%'>
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
            bg='whiteAlpha.200'
            w='100%'
            borderRadius='lg'
            border='solid 1px'
            borderColor='white/30'
            value={customerName}
            onChange={(e) => onNameChange(e.currentTarget.value)}
            placeholder='نام و نام خانوادگی خود را وارد کنید'
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
            bg='whiteAlpha.200'
            w='100%'
            borderRadius='lg'
            border='solid 1px'
            borderColor='white/30'
            value={customerCompany}
            onChange={(e) => onCompanyChange(e.currentTarget.value)}
            placeholder='نام شرکت یا زمینه کاری خود را وارد کنید'
          />
        </Flex>

        <Flex direction='column' align='center' w='100%'>
          <Button
            onClick={onSubmit}
            bgGradient='to-r'
            gradientFrom='green.500'
            gradientTo='green.600'
            w={{ base: '100%', md: '13rem' }}
            color='white'
            py={{ base: 4, md: 6 }}
            px={{ base: 6, md: 8 }}
            borderRadius='xl'
            fontSize={{ base: 'md', md: 'lg' }}
            disabled={!customerName.trim() || !customerCompany.trim()}
          >
            ارسال در واتس اپ
          </Button>
          <Heading
            mt='5'
            textStyle='md'
            size={{ base: 'sm', md: 'lg' }}
            color='whiteAlpha.700'
            textAlign='center'
            px={2}
          >
            قبل از ارسال پیام، در حساب واتس اپ خود لاگین باشید
          </Heading>
        </Flex>
      </Flex>
    </Box>
  )
);

CustomerForm.displayName = 'CustomerForm';

// Main App component
const App = memo(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');

  // Memoized calculations
  const totalPrice = useMemo(
    () => products.reduce((sum, item) => sum + item.price * item.number, 0),
    [products]
  );

  const hasProducts = products.length > 0;

  // Optimized handlers
  const handleSendMessage = useCallback(() => {
    const trimmedName = customerName.trim();
    const trimmedCompany = customerCompany.trim();

    if (!trimmedCompany || !trimmedName) {
      toaster.create({
        description: 'لطفا مشخصات مورد نیاز را وارد نمایید',
        type: 'error',
      });
      return;
    }

    if (!hasProducts) {
      toaster.create({
        description: 'لطفا حداقل یک محصول انتخاب کنید',
        type: 'error',
      });
      return;
    }

    const productsText = products
      .map(
        (p) =>
          `${p.name} ${p.options} \n      X ${p.number} \n     --------------------- \n `
      )
      .join('');

    const message = `سلام وقت بخیر\n${trimmedName} هستم از شرکت ${trimmedCompany}\n${productsText}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }, [customerName, customerCompany, products, hasProducts]);

  const handleSelectProduct = useCallback((newSelected: Product[]) => {
    setProducts([...newSelected]);
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

  const handleRemoveProduct = useCallback((productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

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
      minW={{ lg: '1685px' }}
      w='100%'
      overflow='hidden'
    >
      <Tabs.Root variant='enclosed' defaultValue='HMI'>
        <Tabs.List>
          <Tabs.Trigger value='HMI'>HMI</Tabs.Trigger>
          <Tabs.Trigger value='PLC'>HMI-PLC</Tabs.Trigger>
          <Tabs.Trigger value='sensor'>Sensor</Tabs.Trigger>
          <Tabs.Trigger value='supplies'>Supplies</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='HMI'>
          <HMI selectNewproduct={handleSelectProduct} />
        </Tabs.Content>
        <Tabs.Content value='PLC'>
          <PLC selectNewproduct={handleSelectProduct} />
        </Tabs.Content>
      </Tabs.Root>

      <ProductsList
        products={products}
        onCopy={handleCopy}
        onUpdateQuantity={handleUpdateProductQuantity}
        onRemove={handleRemoveProduct}
      />

      {hasProducts && (
        <TotalPriceDisplay totalPrice={totalPrice} onCopy={handleCopy} />
      )}

      <CustomerForm
        customerName={customerName}
        customerCompany={customerCompany}
        onNameChange={setCustomerName}
        onCompanyChange={setCustomerCompany}
        onSubmit={handleSendMessage}
      />
    </Box>
  );
});

App.displayName = 'App';

export default App;
