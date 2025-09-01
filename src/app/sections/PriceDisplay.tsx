import { Box, Heading } from '@chakra-ui/react';
import { memo } from 'react';
import { handleCopy } from '../features/UtilityFunctions';

const PriceDisplay = memo<{ price: number; grFrom: string; grTo: string }>(
  ({ price, grFrom, grTo }) => (
    <Box
      p={{ base: 6, md: 10 }}
      borderRadius='2xl'
      boxShadow='sm'
      bgGradient='to-r'
      gradientFrom={grFrom}
      gradientTo={grTo}
      w={{ base: '95%', md: 'auto' }}
    >
      <Heading
        _hover={{ color: '#fbb130' }}
        size={{ base: 'xl', md: '2xl' }}
        cursor='pointer'
        onClick={() => handleCopy(price.toLocaleString())}
        textAlign='center'
      >
        {price.toLocaleString()} ریال
      </Heading>
    </Box>
  )
);
export default PriceDisplay;
