import { Flex, Heading } from '@chakra-ui/react';
import { memo } from 'react';

const PriceDisplay = memo<{ price: number; grFrom: string; grTo: string }>(
  ({ price, grFrom, grTo }) => (
    <Flex
      flexDir='column'
      padding={{ base: '4', md: '8' }}
      borderRadius='3xl'
      gap={4}
      bgGradient='to-r'
      gradientFrom={grFrom}
      gradientTo={grTo}
    >
      <Heading size={{ base: 'xl', md: '3xl' }} textAlign='center'>
        مبلغ :
      </Heading>
      <Heading size={{ base: 'xl', md: '2xl' }} textAlign='center'>
        {price.toLocaleString()} ریال
      </Heading>
    </Flex>
  )
);
export default PriceDisplay;
