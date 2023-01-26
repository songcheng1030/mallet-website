import { Space, Button, Table, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectBlockchains } from '../../../store/network/network.selectors';
import { getAllBlockchain, deleteBlockchain } from '../../../store/network/network.action';
import { AddNewBlockchain } from './AddNewBlockchain';
import { EditBlockchain } from './EditBlockchain';
import { IBlockchain } from '../../../types';
import { formattedNumber } from '../../../shared';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";

export const Blockchain = () => {
  const blockchainData = useSelector(selectBlockchains);
  const dispatch = useDispatch();

  const [visible, setVisible] = useState<boolean>(false);
  const [blockchain, setBlockchain] = useState<IBlockchain>();
  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);

  const elapsedTime = useSelector(selectElapsedTime);

  const handleDelete = (id: string) => {
    if (id === '') return;
    dispatch(deleteBlockchain(id));
  }

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);
    if ((elapsedTime - initTime) % 2 === 0) {
      dispatch(getAllBlockchain());
    }
  }, [elapsedTime, flag, initTime, dispatch]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Chain Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Chain ID',
      dataIndex: 'chainId',
      key: 'chainId',
    },
    {
      title: 'Coin Symbol',
      dataIndex: 'coinSymbol',
      key: 'coinSymbol',
    },
    {
      title: 'Max Gas Price (Current)',
      key: 'maxGasPrice',
      render: (bc: IBlockchain) => (
        <div>
          {formattedNumber(bc.gasPrice, 2)}
        </div>
      )
    },
    {
      title: 'Gas Price Limit',
      key: 'gasPriceLimit',
      render: (bc: IBlockchain) => (
        <div>
          {formattedNumber(bc.gasPriceLimit, 2)}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (blockchain: IBlockchain) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            size={'small'}
            onClick={() => { setBlockchain(blockchain); setVisible(true) }}
          >
            Edit
          </Button>
          <Popconfirm
            placement="top"
            title="Are you sure you want to delete this blockchain?"
            onConfirm={() => handleDelete(blockchain._id || '')}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" shape="round" icon={<DeleteOutlined />} size={'small'} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-end">
        <AddNewBlockchain />
      </div>
      <Table
        columns={columns}
        dataSource={blockchainData}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />
      {blockchain && <EditBlockchain
        blockchain={blockchain}
        visible={visible}
        setVisible={setVisible}
      />}
    </div>
  )
}