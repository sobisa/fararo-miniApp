import { Box, Heading } from '@chakra-ui/react';
import { memo } from 'react';
import type { CategoriesProps } from '../../interfaces/IHMI';

const PLC = memo<CategoriesProps>((selectNewproduct) => {
  return (
    <Box
      padding={{ base: '4', md: '8' }}
      borderRadius='2xl'
      display='flex'
      flexDir='column'
      justifyContent='center'
      alignItems='center'
      gap={{ base: '6', md: '10' }}
      minH='100vh'
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
        پیکربندی محصولات HMI-PLC
      </Heading>
    </Box>
  );
});
export default PLC;
