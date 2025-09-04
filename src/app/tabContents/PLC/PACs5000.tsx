import { Button, Flex, Grid, Heading } from '@chakra-ui/react';
import React, { memo, useCallback, useState } from 'react';
import {
  MODEL_OPTIONS_5,
  PLC_INITIAL_CONFIG,
  type PLCConfigState,
} from '../../../interfaces/IPLC';
import ConfigSelector from '../../sections/ConfigSelector';
import PriceDisplay from '../../sections/PriceDisplay';
import { useExcelData, usePLCCalculations } from '../../../hooks/customHooks';
import type { CategoriesProps } from '../../../interfaces/IHMI';

const PACs5000 = memo<CategoriesProps>((selectNewproduct) => {
  const [config, setConfig] = useState<PLCConfigState>(PLC_INITIAL_CONFIG);
  const { data } = useExcelData();

  const { currentPrice, currentPartNumber, currentPLC } = usePLCCalculations(
    config,
    data
  );
  const handleAddProduct = useCallback(() => {}, []);
  const handleConfigChange = useCallback(
    (field: keyof PLCConfigState, value: string) => {
      setConfig((prev) => {
        const newConfig = { ...prev, [field]: value };
        console.log(newConfig);
        return newConfig;
      });
    },
    []
  );

  return (
    <Flex
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
      <Flex gap={'5'} align={'center'}>
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
            پارت نامبر HMI :
          </Heading>
          <Heading
            bgClip='text'
            bgGradient='to-r'
            gradientFrom='yellow.400'
            gradientTo='orange.600'
            fontSize={{ base: 'xl', md: '3xl' }}
            letterSpacing='widest'
            cursor='pointer'
            title='برای کپی کلیک کنید'
            textAlign='center'
            wordBreak='break-all'
          >
            {currentPartNumber}
          </Heading>
        </Flex>
        <PriceDisplay
          price={currentPrice}
          grFrom={'blue.500'}
          grTo={'cyan.600'}
        />
      </Flex>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
          md: 'repeat(1, 1fr)',
          lg: 'repeat(1, 1fr)',
        }}
        gap={{ base: 2, md: 3 }}
        w={{ base: '95%', md: 'auto' }}
        maxW='90vw'
      >
        <ConfigSelector
          title='مدل دستگاه'
          options={MODEL_OPTIONS_5}
          value={config.model}
          onChange={(value) => handleConfigChange('model', value)}
          bgFrom='purple.600'
          bgTo='pink.400'
        />
      </Grid>
      <Button
        bgGradient='to-r'
        gradientFrom='orange.500'
        gradientTo='red.500'
        color='white'
        _hover={{ shadow: '2xl', shadowColor: 'orange.500' }}
        p={{ base: 6, md: 8 }}
        borderRadius='2xl'
        onClick={() => handleAddProduct}
        w={{ base: '200px', md: 'auto' }}
        fontSize={{ base: 'md', md: 'lg' }}
      >
        تایید
      </Button>
    </Flex>
  );
});

export default PACs5000;
