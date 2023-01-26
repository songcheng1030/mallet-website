import { useState, useEffect } from 'react';
import { Button, Table, Space, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { EditCexAccount } from './components/EditCexAccount';
import { loadMyCexAccounts, deleteCexAccount } from '../../store/cexAccount/cexAccount.actions';
import { selectMyCexAccounts } from "../../store/cexAccount/cexAccount.selectors";
import { IUser, ICexAccount } from '../../types';

export const CexAccount = () => {
  const dispatch = useDispatch();
  const cexAccountData = useSelector(selectMyCexAccounts);
  const [visible, setVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ICexAccount | null>(null);
  
  useEffect(() => {
    dispatch(loadMyCexAccounts());
  }, [dispatch]);

  const handleDelete = (id: string) => {
    dispatch(deleteCexAccount(id));
  }

  const handleEdit = (account: ICexAccount) => {
    setSelectedAccount(account);
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
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (account: ICexAccount) => (
        <Space size="middle">
          <Button size='small' type="primary" shape="round" onClick={()=>handleEdit(account)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Popconfirm placement="top" title="Are you sure you want to delete this wallet?" onConfirm={()=>handleDelete(account._id ? account._id : '')} okText="Yes" cancelText="No">
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
        dataSource={cexAccountData} 
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />

      {visible && selectedAccount && (
        <EditCexAccount 
          account={selectedAccount}
          visible={visible}
          setVisible={setVisible}
        />
      )}
    </>
  )
}
