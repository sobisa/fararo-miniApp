import {
  Flex,
  Popover,
  Button,
  Heading,
  NumberInput,
  CloseButton,
  Text,
} from '@chakra-ui/react';
import { memo } from 'react';
import type { Product } from '../../interfaces/IHMI';

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
