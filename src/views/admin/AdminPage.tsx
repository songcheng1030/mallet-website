import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Table, Space, Select, Popconfirm, Modal } from 'antd';
import { CheckOutlined, BlockOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined, SwapOutlined } from '@ant-design/icons';

import { EUserStatus, UserStatusStrings, IUser, EUserRole } from '../../types';
import { selectUsers } from "../../store/user/user.selectors";
import { getUsers, updateUser } from '../../store/user/user.actions';

export const AdminPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<UserStatusStrings | 'all'>('all');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<EUserRole | undefined>(undefined);

  const { Option } = Select;
  const dispatch = useDispatch();
  const data = useSelector(selectUsers);
  const { confirm } = Modal;

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let computedData = data.slice();

    computedData = data.filter((item: IUser) => selectedStatus === 'all' || item.status === selectedStatus);
    return computedData;
  }, [data, selectedStatus]);

  const handleUpdateStatus = (id: string, status: EUserStatus) => {
    dispatch(updateUser(id, {status}))
  }

  const handleUpdateRole = () => {
    if (!selectedUser || !selectedRole) {
      return;
    }

    confirm({
      title: `Confirm`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to change the role to ${selectedRole}?`,
      onOk() {
        dispatch(updateUser(selectedUser, {role: selectedRole}));
        setIsVisible(false);
      },
      onCancel() {},
    });
  }

  const handleSelectUser = (_id: string, role: EUserRole) => {
    setSelectedRole(role);
    setSelectedUser(_id);
    setIsVisible(true);
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      key: 'role',
      render: (row: any) => (
        <div className='flex flex-wrap justify-evenly items-center'>
          <div>{row.role}</div>
          <Button shape='round' size='small' icon={<SwapOutlined />} onClick={() => {handleSelectUser(row._id, row.role)}}>
            Change
          </Button>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Online',
      dataIndex: 'online',
      key: 'online',
      render: (online: boolean) => (
        <Space size="middle">
          <div>
            {online ? 'Online' : 'Offline'}
          </div>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (row: any) => (
        <Space size="middle">
          {/* <Button shape="round" icon={<RetweetOutlined />} size={'small'}>
            Password Reset
          </Button> */}
          {row.status !== EUserStatus.APPROVED && (
            <Popconfirm 
              placement="top" 
              title="Are you sure you want to approve this user?" 
              onConfirm={()=>handleUpdateStatus(row._id, EUserStatus.APPROVED)} 
              okText="Yes" 
              cancelText="No"
            >
              <Button shape="round" icon={<CheckOutlined />} size={'small'} >
                Approve
              </Button>
            </Popconfirm>
          )}
          {row.status !== EUserStatus.BLOCKED && (
            <Popconfirm 
              placement="top" 
              title="Are you sure you want to block this user?" 
              onConfirm={()=>handleUpdateStatus(row._id, EUserStatus.BLOCKED)} 
              okText="Yes" 
              cancelText="No"
            >
              <Button shape="round" icon={<BlockOutlined />} size={'small'} >
                Block
              </Button>
            </Popconfirm>
          )}
          {/* <Button shape="round" icon={<DeleteOutlined />} size={'small'}>
            Delete
          </Button> */}
        </Space>
      ),
    },
  ];

  const handleChange = (value: UserStatusStrings | 'all') => {
    setSelectedStatus(value);
  }

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="h-12 p-3 flex justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <div className="text-lg font-bold text-gray-light"> </div>
          <Select defaultValue="all" className="w-28" onChange={handleChange}>
            <Option value='all'>ALL</Option>
            <Option value={EUserStatus.TBA}>TBA</Option>
            <Option value={EUserStatus.APPROVED}>APPROVED</Option>
            <Option value={EUserStatus.BLOCKED}>BLOCKED</Option>
          </Select>
        </div>
      </div>
      <div className="p-3 bg-gray-dark">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id"
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </div>

      <Modal title="Change Role" visible={isVisible} onOk={handleUpdateRole} onCancel={() => setIsVisible(false)}>
        <div className='flex justify-center items-center'>
          <Select value={selectedRole} className="w-40" onChange={(role: EUserRole) => setSelectedRole(role)}>
            <Option value={EUserRole.ADMIN}>ADMIN</Option>
            <Option value={EUserRole.MAINTAINER}>MAINTAINER</Option>
            <Option value={EUserRole.MONITOR}>MONITOR</Option>
            <Option value={EUserRole.TRADER}>TRADER</Option>
            <Option value={EUserRole.LIQUIDATOR}>LIQUIDATOR</Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
}
