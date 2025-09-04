import { Box, Button, Heading, HStack, RadioGroup } from '@chakra-ui/react';
import { memo, useCallback, useState } from 'react';
import type { CategoriesProps } from '../../../interfaces/IHMI';

import PACs5000 from './PACs5000';

const PLC = memo<CategoriesProps>((selectNewproduct) => {
  const [products, setProducts] = useState([]);
  const handleAddProduct = useCallback(() => {
    const name = current;
    setProducts([]);
  }, []);

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
        پیکربندی محصولات PLC
      </Heading>
      <Box>
        <RadioGroup.Root>
          <HStack>
            <RadioGroup.Item key={'5'} value={'5'}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>سری 5000</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item key={'6'} value={'6'}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>سری 6000</RadioGroup.ItemText>
            </RadioGroup.Item>
          </HStack>
        </RadioGroup.Root>
      </Box>
      <PACs5000 selectNewproduct={selectNewproduct} />
    </Box>
  );
});
export default PLC;
