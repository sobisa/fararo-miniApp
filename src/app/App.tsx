import {
  Box,
  Button,
  CloseButton,
  Flex,
  Heading,
  NativeSelect,
  NumberInput,
  Popover,
  Tabs,
  Text,
} from '@chakra-ui/react';
import '../styles/App.css';
import { memo } from 'react';
import * as XLSX from 'xlsx';
import type { ConfigOption, FileData, Product } from '../interfaces/IHMI';
import HMI, { SIZES } from './tabContents/HMI';

// Types

// Constants

// Utility functions
export const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

export const loadExcelData = async (): Promise<FileData[]> => {
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
};

// Memoized Components
export const ConfigSelector = memo<{
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
          bgGradient={'to-r'}
          color={'black'}
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

export const ProductRow = memo<{
  product: Product;
  index: number;
  onCopy: (text: string) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (id: number) => void;
}>(({ product, index, onCopy, onUpdateQuantity, onRemove }) => (
  <Flex
    padding={{ base: '3', md: '5' }}
    background='white'
    borderRadius={'3xl'}
    shadow={'2xl'}
    border={'1px solid'}
    borderColor={'gray.200'}
    _hover={{ shadow: 'xl' }}
    gap={{ base: '2', md: '4' }}
    color={'black'}
    direction={{ base: 'column', md: 'row-reverse' }}
    alignItems={'center'}
    w='100%'
  >
    <Popover.Root positioning={{ placement: 'bottom-end' }}>
      <Popover.Trigger asChild>
        <Button
          size='sm'
          color='white'
          variant='solid'
          borderRadius='full'
          bgGradient={'to-r'}
          gradientFrom={'cyan.400'}
          gradientTo={'cyan.500'}
        >
          ?
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content background='white' borderRadius='xl' maxW='90vw'>
          <Popover.Arrow>
            <Popover.ArrowTip background='white!' border='none' />
          </Popover.Arrow>
          <Popover.Body background='white' borderRadius='xl'>
            <Popover.Title fontSize={{ base: 'lg', md: 'xl' }}>
              مشخصات محصول
            </Popover.Title>
            <Text my='4' textAlign='right' fontSize={{ base: 'sm', md: 'md' }}>
              {product.description}
            </Text>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>

    <Heading
      textAlign='center'
      fontSize={{ base: 'sm', md: 'lg' }}
      letterSpacing='widest'
      _hover={{ color: '#fbb130' }}
      cursor='pointer'
      onClick={() => onCopy(product.name)}
      flex='1'
      wordBreak='break-all'
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
          fontSize={{ base: 'lg', md: '2xl' }}
          color={'white'}
          size={{ base: 'sm', md: 'md' }}
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
          fontSize={{ base: 'sm', md: 'md' }}
        />
        <Button
          onClick={() => onUpdateQuantity(index, product.number + 1)}
          backgroundGradient={'to-r'}
          gradientFrom={'green.500'}
          gradientTo={'green.600'}
          fontSize={{ base: 'md', md: 'lg' }}
          color={'white'}
          size={{ base: 'sm', md: 'md' }}
        >
          +
        </Button>
      </Flex>
    </NumberInput.Root>

    <Heading
      _hover={{ color: '#fbb130' }}
      cursor='pointer'
      onClick={() => onCopy((product.price * product.number).toLocaleString())}
      fontSize={{ base: 'md', md: 'lg' }}
      textAlign='center'
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

const App = () => {
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
    >
      <Tabs.Root variant={'enclosed'} defaultValue={'HMI'}>
        <Tabs.List>
          <Tabs.Trigger value='HMI'>HMI</Tabs.Trigger>
          <Tabs.Trigger value='PLC'>PLC</Tabs.Trigger>
          <Tabs.Trigger value='sensor'>Sensor </Tabs.Trigger>
          <Tabs.Trigger value='suplies'>Suplies</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='HMI'>
          <HMI />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default App;

// Custom Hooks

// Main Component
