export const tokenTxColumns = [
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (value: string) => (
      <div className={value === 'Buy'? 'text-blue' : 'text-red'}>{value}</div>
    )
  },
  {
    title: 'Tokens',
    key: 'tokens',
    render: (row: any) => (
      <div className={row.type === 'Buy'? 'text-blue' : 'text-red'}>{row.tokens}</div>
    )
  },
  {
    title: 'Price',
    key: 'price',
    render: (row: any) => (
      <div className={row.type === 'Buy'? 'text-blue' : 'text-red'}>{row.price}</div>
    )
  },
  {
    title: 'Price/Token',
    key: 'priceToken',
    render: (row: any) => (
      <div className={row.type === 'Buy'? 'text-blue' : 'text-red'}>{row.priceToken}</div>
    )
  },
  {
    title: 'Time',
    key: 'time',
    render: (row: any) => (
      <div className={row.type === 'Buy'? 'text-blue' : 'text-red'}>{row.time}</div>
    )
  },
  {
    title: 'Tx',
    key: 'tx',
    render: (row: any) => (
      <div className={row.type === 'Buy'? 'text-blue' : 'text-red'}>{row.tx}</div>
    )
  },
];

export const tokenTxData = [
  {
    _id: '101',
    type: 'Buy',
    tokens: '7,533,126 CM',
    price: '$8,067.38',
    priceToken: '$0.001071',
    time: '7:01:22 AM',
    tx: '0xc223'
  },
  {
    _id: '102',
    type: 'Sell',
    tokens: '75,608,325 CM',
    price: '$123,403.00',
    priceToken: '$0.001632',
    time: '4:12:01 AM',
    tx: '0xe1f1'
  },
];

export const buyerColumns = [
  {
    title: 'Wallet',
    dataIndex: 'wallet',
    key: 'wallet',
  },
  {
    title: 'Total Bought',
    dataIndex: 'totalBought',
    key: 'totalBought',
  },
];

export const buyerData = [
  {
    _id: '101',
    wallet: '0xaf94addcd732ba72cf4549128bb5b76d15d45138',
    totalBought: '$8,033.21',
  },
];

export const sellerColumns = [
  {
    title: 'Wallet',
    dataIndex: 'wallet',
    key: 'wallet',
  },
  {
    title: 'Total Sold',
    dataIndex: 'totalSold',
    key: 'totalSold',
  },
];

export const sellerData = [
  {
    _id: '101',
    wallet: '0xaf94addcd732ba72cf4549128bb5b76d15d45138',
    totalSold: '$625,729.94',
  },
];
