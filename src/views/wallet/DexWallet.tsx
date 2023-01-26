import { useState, useEffect } from 'react';
import { Button, Table, Space, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { EditDexWallet } from './components/EditDexWallet';
import { loadMyWallet, deleteWallet } from '../../store/wallet/wallet.actions';
import { selectMyWallets } from "../../store/wallet/wallet.selectors";
import { IUser, IWallet } from '../../types';
import { shortenAddress } from '../../shared';
import { CopyableLabel } from '../../components/common/CopyableLabel';

export const DexWallet = () => {
  const dispatch = useDispatch();
  const walletData = useSelector(selectMyWallets);
  const [visible, setVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<IWallet | null>(null);
  
  useEffect(() => {
    dispatch(loadMyWallet());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteWallet(id));
  }

  const handleEdit = (wallet: IWallet) => {
    setSelectedWallet(wallet);
    setVisible(true);
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Owner name',
      dataIndex: 'owner',
      key: 'ownerName',
      render: (owner: IUser) => (
        <div> {owner.username} </div>
      )
    },
    {
      title: 'Owner email',
      dataIndex: 'owner',
      key: 'ownerEmail',
      render: (owner: IUser) => (
        <div> {owner.email} </div>
      )
    },
    {
      title: 'Address',
      dataIndex: 'publicKey',
      key: 'address',
      render: (address: string) => (
        <Space>
          <div>{shortenAddress(address)}</div>
          <CopyableLabel value={address} label=""/>
        </Space>
      )
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: () => (
        <div>--</div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (wallet: IWallet) => (
        <Space size="middle">
          <Button size='small' type="primary" shape="round" onClick={()=>handleEdit(wallet)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Popconfirm placement="top" title="Are you sure you want to delete this wallet?" onConfirm={()=>handleDelete(wallet._id ? wallet._id : '')} okText="Yes" cancelText="No">
            <Button type="primary" shape="round" icon={<DeleteOutlined />} size={'small'} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table 
        columns={columns} 
        expandable={{
          expandedRowRender: record => (
            <>
              {record.users.map((user, idx) => (
                <div className="flex justify-between text-left px-5" key={idx}>
                  <div className="w-60"> {user.username} </div>
                  <div className="w-60"> {user.email} </div>
                  <div className="w-60"> {user.role} </div>
                  <div className=""> {user.status} </div>
                </div>
              ))}
            </>
          ),
          rowExpandable: record => true
        }}
        dataSource={walletData} 
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />

      {visible && selectedWallet && (
        <EditDexWallet 
          wallet={selectedWallet}
          visible={visible}
          setVisible={setVisible}
        />
      )}
    </>
  )
}
