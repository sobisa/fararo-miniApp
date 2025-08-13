import {
  Box,
  Button,
  CloseButton,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  NumberInput,
  Popover,
  Text,
} from '@chakra-ui/react';
import './App.css';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { toaster } from './components/ui/toaster';

type Products = {
  id: number;
  name: string;
  number: number;
  price: number;
  description: string;
};
type Files = {
  name: string;
  price: number;
  description: string;
};
function App() {
  const [size, setSize] = useState('7035E');
  const [voltage, setVoltage] = useState('AC');
  const [output, setOutput] = useState('T');
  const [ai, setAi] = useState('0');
  const [ao, setAo] = useState('0');
  const [sdCard, setSdCard] = useState('N');
  const [lan, setLan] = useState('L');
  const [products, setProducts] = useState<Products[]>([]);
  const [id, setId] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [data, setData] = useState<Files[]>([]);
  const [price, setPrice] = useState(data[0]?.price ?? 0);
  const [description, setDescription] = useState(data[0]?.description ?? '');
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    fetch('/data.xlsx')
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Files[] = XLSX.utils.sheet_to_json(worksheet);

        setData(jsonData);

        setPrice(jsonData[0].price);
      });
  }, []);
  useEffect(() => {
    const pac = data.find((pr) => pr.name === `PACs ${size}`);
    if (!pac) return;

    const priceExtras = () => {
      let extra = 0;
      const relePrice = data[7].price;
      if (output === 'R') {
        extra +=
          size === '7035E'
            ? relePrice * 5
            : size === '7070E2'
            ? relePrice * 12
            : relePrice * 20;
      }
      extra += data[5].price * parseInt(ai);
      extra += data[6].price * parseInt(ao);
      if (sdCard === 'S') extra += data[3].price;
      if (size === '7035E' && lan === 'L') extra += data[4].price;
      return extra;
    };

    const descriptionText = () => {
      const voltageText =
        voltage === 'AC' ? ' تغذیه 220 ولت AC' : ' منبع تغذیه 24 ولت DC';
      const outputText = output === 'T' ? ' خروجی ترانزیستوری' : 'خروجی رله ای';
      const aiText = ai !== '0' ? `${ai} ورودی آنالوگ -` : '';
      const aoText = ao !== '0' ? `${ao} خروجی آنالوگ -` : '';
      const sdCardText =
        sdCard === 'S' ? 'کارت حافظه 16 گیگ ' : 'فاقد کارت حافظه';
      const lanText =
        size === '7035E'
          ? lan === 'L'
            ? '-پورت اترنت '
            : '-بدون پورت اترنت'
          : '';
      return `${pac.description}
       آپشن ها: ${voltageText}${outputText}-${aiText}${aoText}${sdCardText}${lanText}`;
    };

    setPrice(pac.price + priceExtras());
    setDescription(descriptionText());

    if (size !== '7035E') {
      setLan('L');
    }
  }, [size, voltage, output, ai, ao, sdCard, lan, data]);
  useEffect(() => {
    const total = products.reduce(
      (sum, item) => sum + item.price * item.number,
      0
    );
    setTotalPrice(total);
  }, [products]);
  const handleCopy = () => {
    const name = `PACs${size}-${voltage}${output}${ai}${ao}${sdCard}`;
    navigator.clipboard.writeText(name);
  };
  const handleClick = () => {
    const name = `PACs${size}-${voltage}${output}${ai}${ao}${sdCard}${lan}`;
    let repeat = false;
    products.forEach((o) => {
      if (o.name == name) {
        o.number++;
        repeat = true;
        setProducts([...products]);
      }
    });
    if (!repeat) {
      setId(id + 1);
      setProducts([
        ...products,
        {
          name: name,
          id: id,
          number: 1,
          price: price,
          description: description,
        },
      ]);
    }
  };
  const handleClose = (id: number) => {
    products.splice(products.indexOf(products.find((x) => x.id == id)!), 1);
    setProducts([...products]);
  };
  const handleSend = () => {
    let mess = '';
    products.map((p) => {
      mess += `${p.name} X ${p.number} \n`;
    });
    if (customerCompany.length == 0 || customerName.length == 0) {
      toaster.create({
        description: 'File saved successfully',
        type: 'info',
      });
    }
    const company = `از شرکت ${customerCompany}`;
    const message = `سلام وقت بخیر\n${customerName} هستم ${
      customerCompany.trim.length > 0 ? company : ''
    }\n${mess}می‌خوام`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/+989196040485?text=${encodedMessage}`;
    if (mess.length > 0) {
      window.open(url, '_blank');
    }
  };
  return (
    <Box
      // shadow={'lg'}
      padding={'8'}
      // mt='6'
      // bgGradient='to-r'
      // gradientFrom='#0a1115/0'
      // gradientTo='#0f1b24/80'
      bg={'#F5F6F6'}
      borderRadius={'2xl'}
      display='flex'
      flexDir={'column'}
      justifyContent='center'
      alignItems='center'
      gap={'3'}
    >
      <Flex flexDir={'row'} gap={4}>
        <Heading size={'3xl'}>پارت نامبر HMI : </Heading>
        <Flex align={'center'}>
          <Heading
            fontSize='3xl'
            letterSpacing='widest'
            cursor='pointer'
            onClick={handleCopy}
            _hover={{ color: '#fbb130' }}
            title='برای کپی کلیک کنید'
          >{`PACs${size}-${voltage}${output}${ai}${ao}${sdCard}${lan}`}</Heading>
        </Flex>
      </Flex>
      <Box
        direction={'column'}
        gap={'8'}
        bg='##0f1b24	'
        p={4}
        borderRadius='2xl'
        boxShadow='sm'
      >
        <Heading>{price.toLocaleString()} ریال</Heading>
      </Box>
      <Box
        direction={'column'}
        gap={'8'}
        bg='##0f1b24	'
        p={5}
        borderRadius='2xl'
        boxShadow='sm'
      >
        <Text fontWeight={'medium'} textAlign={'right'} whiteSpace={'pre-line'}>
          {description}
        </Text>
      </Box>
      <Grid templateColumns={{ base: '2fr', md: 'repeat(3, 1fr)' }} gap={3}>
        <Box
          direction={'column'}
          bg='#F5F6F6	'
          // bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            اندازه نمایشگر
          </Heading>
          <NativeSelect.Root size='sm' w='15rem'>
            <NativeSelect.Field
              value={size}
              borderRadius={'lg'}
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              colorPalette={'#2e4150'}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              onChange={(e) => {
                setSize(e.currentTarget.value);
                setAi('0');
                setAo('0');
              }}
            >
              <option value='7035E'>3.5 اینچ</option>
              <option value='7070E2'>7 اینچ</option>
              <option value='7101E'>10 اینچ</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        <Box
          direction={'column'}
          gap={'8'}
          bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            منبع تغذیه
          </Heading>
          <NativeSelect.Root size='sm' w='15rem'>
            <NativeSelect.Field
              borderRadius={'lg'}
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              colorPalette={'#2e#ff0000'}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              value={voltage}
              onChange={(e) => setVoltage(e.currentTarget.value)}
            >
              <option value='DC'>24V DC تغذیه</option>
              <option value='AC'>220V AC تغذیه</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        <Box
          direction={'column'}
          gap={'8'}
          bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            نوع خروجی
          </Heading>
          <NativeSelect.Root size='sm' w='15rem'>
            <NativeSelect.Field
              borderRadius={'lg'}
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              value={output}
              onChange={(e) => setOutput(e.currentTarget.value)}
            >
              <option value='T'>خروجی ترانزیستوری</option>
              <option value='R'>خروجی رله ای</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>

        <Box
          direction={'column'}
          gap={'8'}
          bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            تعداد ورودی آنالوگ
          </Heading>
          <NativeSelect.Root
            size='sm'
            w='15rem'
            _hover={{ borderColor: '#2e4150' }}
            _focus={{ borderColor: '#2e4150' }}
          >
            <NativeSelect.Field
              borderRadius={'lg'}
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              colorPalette={'#2e4150'}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              value={ai}
              onChange={(e) => setAi(e.currentTarget.value)}
            >
              <option value='0'>0</option>
              <option
                value='1'
                disabled={
                  (1 + parseInt(ao) > 2 && size == '7035E') ||
                  (1 + parseInt(ao) > 2 && size == '7070E2') ||
                  (1 + parseInt(ao) > 4 && size != '7035E')
                }
              >
                1
              </option>
              <option
                value='2'
                disabled={
                  (2 + parseInt(ao) > 2 && size == '7035E') ||
                  (2 + parseInt(ao) > 3 && size == '7070E2') ||
                  (2 + parseInt(ao) > 4 && size != '7035E')
                }
              >
                2
              </option>

              <option
                value='3'
                disabled={
                  3 + parseInt(ao) > 4 ||
                  (2 + parseInt(ao) > 3 && size == '7070E2') ||
                  size == '7035E'
                }
              >
                3
              </option>
              <option
                value='4'
                disabled={
                  4 + parseInt(ao) > 4 || size == '7035E' || size == '7070E2'
                }
              >
                4
              </option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        <Box
          direction={'column'}
          gap={'8'}
          bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            تعداد خروجی آنالوگ
          </Heading>
          <NativeSelect.Root size='sm' w='15rem'>
            <NativeSelect.Field
              borderRadius={'lg'}
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              colorPalette={'#2e4150'}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              value={ao}
              onChange={(e) => setAo(e.currentTarget.value)}
            >
              <option value='0'>0</option>
              <option
                value='1'
                disabled={
                  (parseInt(ai) + 1 > 2 && size == '7035E') ||
                  (parseInt(ai) + 1 > 3 && size == '7070E2') ||
                  (parseInt(ai) + 1 > 4 && size != '7035E')
                }
              >
                1
              </option>
              <option
                value='2'
                disabled={
                  (parseInt(ai) + 2 > 2 && size == '7035E') ||
                  (parseInt(ai) + 2 > 3 && size == '7070E2') ||
                  (parseInt(ai) + 2 > 4 && size != '7035E')
                }
              >
                2
              </option>

              <option
                value='3'
                disabled={
                  parseInt(ai) + 3 > 4 ||
                  (parseInt(ai) + 2 > 3 && size == '7070E2') ||
                  size == '7035E'
                }
              >
                3
              </option>
              <option
                value='4'
                disabled={
                  parseInt(ai) + 4 > 4 || size == '7035E' || size == '7070E2'
                }
              >
                4
              </option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        <Box
          direction={'column'}
          gap={'8'}
          bg='##0f1b24	'
          p={5}
          borderRadius='2xl'
          boxShadow='lg'
        >
          <Heading textAlign='center' fontSize='lg' mb={6}>
            کارت حافظه
          </Heading>
          <NativeSelect.Root size='sm' w='15rem'>
            <NativeSelect.Field
              bg='#fbb130'
              // bg='#0a1115'
              _hover={{ borderColor: '#2e4150' }}
              _focus={{ borderColor: '#2e4150' }}
              colorPalette={'#2e4150'}
              // borderColor='#1f2a33'
              borderColor='#782C0F'
              borderRadius={'lg'}
              value={sdCard}
              onChange={(e) => {
                setSdCard(e.currentTarget.value);
              }}
            >
              <option value='S'>دارد</option>
              <option value='N'>ندارد</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
      </Grid>
      <Box
        direction={'column'}
        gap={'8'}
        bg='##0f1b24	'
        p={5}
        borderRadius='2xl'
        boxShadow='lg'
      >
        <Heading textAlign='center' fontSize='lg' mb={6}>
          کارت حافظه
        </Heading>
        <NativeSelect.Root size='sm' w='15rem' disabled={size != '7035E'}>
          <NativeSelect.Field
            bg='#fbb130'
            // bg='#0a1115'
            _hover={{ borderColor: '#2e4150' }}
            _focus={{ borderColor: '#2e4150' }}
            colorPalette={'#2e4150'}
            // borderColor='#1f2a33'
            borderColor='#782C0F'
            borderRadius={'lg'}
            value={lan}
            onChange={(e) => {
              setLan(e.currentTarget.value);
            }}
          >
            <option value='L'>دارد</option>
            <option value='N'>ندارد</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
      <Button
        bg='#de6407'
        color='white'
        _hover={{ bg: '#de7525' }}
        p={8}
        borderRadius='2xl'
        onClick={handleClick}
      >
        تایید
      </Button>
      <Box
        bg='##0f1b24	'
        p={12}
        borderRadius='2xl'
        boxShadow='lg'
        w='50rem'
        display='flex'
        flexDirection={'column'}
        gap={'4'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Heading size={'xl'}>محصولات انتخاب شده</Heading>
        {products.length > 0 ? (
          products.map((value, index) => {
            return (
              <Flex direction={'row-reverse'} gap={'5'} alignItems={'center'}>
                <Popover.Root positioning={{ placement: 'bottom-end' }}>
                  <Popover.Trigger asChild>
                    <Button
                      size='sm'
                      color={'cyan.600'}
                      variant={'solid'}
                      borderRadius={'full'}
                      background={'cyan.200'}
                    >
                      ?
                    </Button>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content background={'white'} borderRadius={'xl'}>
                      <Popover.Arrow>
                        <Popover.ArrowTip
                          background={'white!'}
                          border={'none'}
                        />
                      </Popover.Arrow>
                      <Popover.Body background={'white'} borderRadius={'xl'}>
                        <Popover.Title fontSize={'xl'}>
                          مشخصات محصول
                        </Popover.Title>
                        <Text my='4'>{value.description}</Text>
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
                <Heading
                  textAlign='center'
                  fontSize='lg'
                  letterSpacing='widest'
                >
                  {value.name}
                </Heading>
                <NumberInput.Root
                  width='70px'
                  defaultValue={value.number.toString()}
                  min={1}
                  value={value.number.toString()}
                  onValueChange={(e) => {
                    products[index] = {
                      description: value.description,
                      id: value.id,
                      name: value.name,
                      number: parseInt(e.value),
                      price: value.price,
                    };

                    setProducts([...products]);
                  }}
                >
                  <NumberInput.Control>
                    <NumberInput.IncrementTrigger
                      _hover={{ background: '#de7525' }}
                    />
                    <NumberInput.DecrementTrigger
                      _hover={{ background: '#de7525' }}
                    />
                  </NumberInput.Control>
                  <NumberInput.Input
                    border={'none'}
                    _hover={{ border: 'none' }}
                    backgroundColor={'#de6407'}
                    color={'white'}
                  />
                </NumberInput.Root>
                <Heading>
                  {(value.price * value.number).toLocaleString()} ریال
                </Heading>
                <CloseButton
                  onClick={() => handleClose(value.id)}
                  size={'2xs'}
                  variant={'ghost'}
                  colorPalette={'#f9130bddf'}
                  background={'#fffffff8f'}
                  borderRadius={'full'}
                />
              </Flex>
            );
          })
        ) : (
          <Heading textAlign='center' fontSize='lg'>
            محصولی اضافه نشده
          </Heading>
        )}
      </Box>
      <Box
        direction={'column'}
        bg='##0f1b24	'
        p={12}
        borderRadius='2xl'
        boxShadow='lg'
        w='40rem'
      >
        <Heading size={'xl'}>قیمت کل</Heading>
        <Heading>{totalPrice.toLocaleString()} ریال</Heading>
      </Box>
      <Box
        direction={'column'}
        bg='##0f1b24	'
        p={12}
        borderRadius='2xl'
        boxShadow='lg'
        w='40rem'
      >
        <Flex
          justify={'center'}
          mb='12'
          direction={'column'}
          alignItems={'center'}
        >
          <Heading mb='5' size={'xl'}>
            نام و نام خانوادگی
          </Heading>
          <Input
            size={'md'}
            required
            w='20rem'
            // colorPalette={'teal'}
            borderRadius={'lg'}
            // border={'#045956 solid 2px'}
            border={'#782C0F solid 2px'}
            textStyle={'xl'}
            value={customerName}
            onChange={(e) => setCustomerName(e.currentTarget.value)}
          />
        </Flex>

        <Flex
          mb='12'
          justify={'center'}
          direction={'column'}
          alignItems={'center'}
        >
          <Heading mb='5' size={'xl'}>
            نام شرکت/ زمینه کاری
          </Heading>

          <Input
            size={'md'}
            required
            w='20rem'
            borderRadius={'lg'}
            // border={'#045956 solid 2px'}
            border={'#782C0F solid 2px'}
            textStyle={'xl'}
            value={customerCompany}
            onChange={(e) => setCustomerCompany(e.currentTarget.value)}
          />
        </Flex>

        <Button
          onClick={handleSend}
          bg='#1c8e37'
          color='white'
          _hover={{ bg: '#20b943' }}
          p={8}
          borderRadius='2xl'
        >
          ارسال در واتس اپ
        </Button>
        <Text mt='5' textStyle={'md'}>
          قبل از ارسال پیام، در حساب واتس اپ خود لاگین باشید
        </Text>
      </Box>
    </Box>
  );
}

export default App;
