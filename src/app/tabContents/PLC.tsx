import { Box, Flex, Heading } from '@chakra-ui/react';
import { memo, useState } from 'react';
import type { CategoriesProps } from '../../interfaces/IHMI';
import { copyToClipboard } from '../features/UtilityFunctions';
import PriceDisplay from '../sections/PriceDisplay';

const PLC = memo<CategoriesProps>((selectNewproduct) => {
  const [partNumber, setPartNumber] = useState('PACs 5000');
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
        gradientFrom='yellow.400'
        gradientTo='orange.600'
        height={{ base: '12', md: '20' }}
        textAlign='center'
      >
        پیکربندی محصولات HMI-PLC
      </Heading>
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
          gradientFrom='yellow.400'
          gradientTo='orange.600'
          fontSize={{ base: 'xl', md: '3xl' }}
          letterSpacing='widest'
          cursor='pointer'
          onClick={() => copyToClipboard(partNumber)}
          _hover={{ color: '#fbb130' }}
          title='برای کپی کلیک کنید'
          textAlign='center'
          wordBreak='break-all'
        >
          {partNumber}
        </Heading>
      </Flex>
      <PriceDisplay price={50000001} grFrom={'blue.500'} grTo={'cyan.600'} />
    </Box>
  );
});
export default PLC;
