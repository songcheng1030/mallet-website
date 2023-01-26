import { useState, useEffect } from "react";
import { Modal, Table, Space } from "antd";
import moment from "moment";

import { shortenAddress, formattedNumber } from "../../../shared";
import { reportService } from "../../../services";
import { IToken } from '../../../types';
import { CopyableLabel } from '../../../components/common/CopyableLabel';

interface Props {
  id: string,
  visible: boolean,
  setVisible: (v: boolean) => void
};

export const Detail = (props: Props) => {
  const { id, visible, setVisible } = props;
  const [data, setData] = useState<any>([]);

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
      dataIndex: 'price',
      key: 'price',
      render: (amount: number) => (
        <div className="text-green">$ {formattedNumber(amount)}</div>
      )
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (amount: number) => (
        <div className="text-green">$ {formattedNumber(amount)}</div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created',
      key: 'date',
      render: (date: string) => (
        <>{moment(date).format('HH:mm:ss MM-DD-YYYY')}</>
      )
    },
  ];

  useEffect(() => {
    if (visible) {
      reportService.getLiquidatorDetail(id).then(res => {
        console.log("res", res)
        setData(res);
      })
      .catch(err => {
        console.log("error", err);
      });
    }
  }, [id, visible]);

  return (
    <Modal
        title="Transaction details"
        visible={visible}
        width={1200}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="_id"
        scroll={{y: 500 }}
        pagination={false}
      />
    </Modal>
  );
}
