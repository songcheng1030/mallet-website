import { useState } from 'react';
import { Button, Space, Table } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import moment from "moment";

import { shortenAddress, formattedNumber } from "../../../shared";
import { ILiquidatorTransaction, IToken } from '../../../types';
import { CopyableLabel } from '../../../components/common/CopyableLabel';
import { Detail } from '../cex/Detail';

interface Props {
  data: ILiquidatorTransaction[]
}

export const LiquidatorReport = (props: Props) => {
  const { data } = props;

  const [visible, setVisible] = useState<boolean>(false);
  const [selected, setSelected] = useState<string | null>(null);

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Token Address',
      dataIndex: 'token',
      key: 'tokenAddress',
      render: (token: IToken) => (
        <Space>
          <div className='text-blue-dark'>[{token.symbol}]</div>
          {shortenAddress(token.address)}
          <CopyableLabel value={token.address} label="" />
        </Space>
      )
    },
    {
      title: 'Token Amount',
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      render: (amount: string) => (
        <>{amount}</>
      )
    },
    {
      title: 'Price',
      dataIndex: 'total',
      key: 'price',
      render: (amount: number) => (
        <div className='text-green'>$ {formattedNumber(amount)}</div>
      )
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (amount: number) => (
        <div className='text-green'>$ {formattedNumber(amount)}</div>
      )
    },
    // {
    //   title: 'Transaction Hash',
    //   dataIndex: 'txHash',
    //   key: 'txHash',
    //   render: (txHash: string) => (
    //     <Space>
    //       {shortenAddress(txHash)}
    //       <CopyableLabel value={txHash} label="" />
    //     </Space>
    //   )
    // },
    {
      title: 'Date',
      dataIndex: 'created',
      key: 'date',
      render: (date: string) => (
        <>{moment(date).format('HH:mm:ss MM-DD-YYYY')}</>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (row: any) => (
        <Space>
          <Button 
            onClick={()=>{setSelected(row._id.liquidator); setVisible(true);}}
          >
            <EyeOutlined /> 
          </Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="_id"
        pagination={false}
      />

      {selected && <Detail visible={visible} setVisible={setVisible} id={selected} />}
    </div>
  );
}
