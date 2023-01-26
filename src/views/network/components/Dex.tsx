import { Space, Button, Table, Popconfirm } from 'antd';
import { IDex } from '../../../types';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectDexs } from '../../../store/network/network.selectors';
import { deleteDex } from '../../../store/network/network.action';
import { AddNewDex } from './AddNewDex';
import { EditDex } from './EditDex';
import { shortenAddress } from '../../../shared';
import { CopyableLabel } from '../../../components/common/CopyableLabel';

export const Dex = () => {
  const dexData = useSelector(selectDexs);
  const [visible, setVisible] = useState<boolean>(false);
  const [dex, setDex] = useState<IDex>();
  const dispatch = useDispatch();

  const handleDelete = (id: string) => {
    dispatch(deleteDex(id));
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'DEX Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Chain ID',
      key: 'chainId',
      render: (row: IDex) => (<>{row.blockchain?.chainId}</>)
    },
    {
      title: 'Chain Name',
      key: 'blockchain_name',
      render: (row: IDex) => (<>{row.blockchain?.name}</>)
    },
    {
      title: 'DEX Type',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Router Address',
      dataIndex: 'routerAddress',
      key: 'routerAddress',
      render: (address: string) => (
        <Space>
          <div>{shortenAddress(address)}</div>
          <CopyableLabel value={address} label=""/>
        </Space>
      )
    },
    {
      title: 'Factory Address',
      dataIndex: 'factoryAddress',
      key: 'factoryAddress',
      render: (address: string) => (
        <Space>
          <div>{shortenAddress(address)}</div>
          <CopyableLabel value={address} label=""/>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 250,
      render: (dex: IDex) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            size={'small'}
            onClick={() => {
              setDex(dex);
              setVisible(true)
            }}
          >
            Edit
          </Button>
          <Popconfirm
            placement="top"
            title="Are you sure you want to delete this blockchain?"
            onConfirm={() => {
              if (dex._id) {
                handleDelete(dex._id)
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

  return (
    <div>
      <div className="flex justify-end">
        <AddNewDex />
      </div>
      <Table 
        columns={columns} 
        dataSource={dexData} 
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />
      {dex && <EditDex
        dex={dex}
        visible={visible}
        setVisible={setVisible}
      />}
    </div>
  )
}