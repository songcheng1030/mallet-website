import { Space, Button, Table, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ICoin } from '../../../types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCoins } from '../../../store/network/network.selectors';
import { getAllCoin, deleteCoin } from '../../../store/network/network.action';
import { AddNewCoin } from './AddNewCoin';
import { shortenAddress } from '../../../shared';
import { CopyableLabel } from '../../../components/common/CopyableLabel';

export const Coin = () => {
  const coinData = useSelector(selectCoins);

  const [loadingbar, setLoadingbar] = useState<boolean>(false);
  const dispatch = useDispatch();
  const handleDelete = (id: string) => {
    dispatch(deleteCoin(id));
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Coin Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Space>
          <div>{shortenAddress(address)}</div>
          <CopyableLabel value={address} label=""/>
        </Space>
      )
    },
    {
      title: 'Blockchain',
      key: 'blockchain',
      render: (row: any) => (<>{row?.blockchain?.name || ""}</>)
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Decimals',
      dataIndex: 'decimals',
      key: 'decimals'
    },
    {
      title: 'Price [$]',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => (
        <span>{value.toFixed(4)}</span>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (coin: ICoin) => (
        <Space size="middle">
          <Popconfirm
            placement="top"
            title="Are you sure you want to delete this coin?"
            onConfirm={() => {
              if (coin._id) {
                handleDelete(coin._id)
              }
            }}
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
  useEffect(() => {
    setLoadingbar(true);
    dispatch(getAllCoin());
    setLoadingbar(false);
  }, [dispatch]);

  return (
    <div>
      {loadingbar && <div>loadingbar</div>}
      <div className="flex justify-end">
        <AddNewCoin />
      </div>
      <Table
        columns={columns}
        dataSource={coinData}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />
    </div>
  )
}