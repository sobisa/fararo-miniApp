import { Box, Heading, NativeSelect } from '@chakra-ui/react';
import { memo } from 'react';
import type { ConfigOption } from '../../interfaces/IHMI';

const ConfigSelector = memo<{
  title: string;
  value: string;
  options: ConfigOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  bgFrom?: string;
  bgTo?: string;
}>(
  ({
    title,
    value,
    options,
    onChange,
    disabled = false,
    bgFrom = 'orange.400',
    bgTo = 'orange.500',
  }) => (
    <Box
      bgGradient='to-br'
      gradientFrom='gray.800'
      gradientTo='gray.900'
      borderRadius='2xl'
    >
      <Box
        direction='column'
        gap='8'
        bgGradient='to-br'
        gradientFrom='blue.500/10'
        gradientTo='purple.500/10'
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
            bgGradient='to-r'
            color='black'
            gradientFrom={bgFrom}
            gradientTo={bgTo}
            _hover={{ borderColor: '#2e4150' }}
            _focus={{ borderColor: '#2e4150' }}
            borderColor='#782C0F'
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
          >
            {options.map(
              ({ value: optValue, label, disabled: optDisabled }) => (
                <option key={optValue} value={optValue} disabled={optDisabled}>
                  {label}
                </option>
              )
            )}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
    </Box>
  )
);
export default ConfigSelector;
