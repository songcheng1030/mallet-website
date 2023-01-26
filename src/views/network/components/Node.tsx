import { Space, Button, Table, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { INode } from '../../../types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectNodes } from '../../../store/network/network.selectors';
import { getAllNode, deleteNode } from '../../../store/network/network.action';
import { AddNewNode } from './AddNewNode';
import { EditNode } from './EditNode';

export const Node = () => {
  const nodeData = useSelector(selectNodes);

  const [loadingbar, setLoadingbar] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [node, setNode] = useState<INode>();
  const dispatch = useDispatch();
  const handleDelete = (id: string) => {
    dispatch(deleteNode(id));
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Node Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Chain Name',
      key: 'blockchain_name',
      render: (row: INode) => (<>{row.blockchain.name}</>)
    },
    {
      title: 'RPC Provider URL',
      dataIndex: 'rpcProviderURL',
      key: 'rpcProviderURL'
    },
    {
      title: 'WebSocket Provider URL',
      dataIndex: 'wsProviderURL',
      key: 'wsProviderURL',
    },
    // {
    //   title: 'IP Address',
    //   dataIndex: 'ipAddress',
    //   key: 'ipAddress'
    // },
    // {
    //   title: 'Node Check Url',
    //   dataIndex: 'checkUrl',
    //   key: 'checkUrl'
    // },
    // {
    //   title: 'Active',
    //   dataIndex: 'active',
    //   key: 'active',
    //   render: (active: boolean) => (
    //     active ? <Tag icon={<SyncOutlined spin />} color="success">running</Tag> :
    //       <Tag icon={<MinusCircleOutlined />} color="default">stopped</Tag>
    //   )
    // },
    {
      title: 'Actions',
      key: 'action',
      render: (node: INode) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            size={'small'}
            onClick={() => {
              setNode(node);
              setVisible(true)
            }}
          >
            Edit
          </Button>
          <Popconfirm
            placement="top"
            title="Are you sure you want to delete this node?"
            onConfirm={() => {
              if (node._id) {
                handleDelete(node._id)
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
    dispatch(getAllNode());
    setLoadingbar(false);
  }, [dispatch]);

  return (
    <div>
      {loadingbar && <div>loadingbar</div>}
      <div className="flex justify-end">
        <AddNewNode />
      </div>
      <Table
        columns={columns}
        dataSource={nodeData}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1100 }}
      />
      {node && <EditNode
        node={node}
        visible={visible}
        setVisible={setVisible}
      />}
    </div>
  )
}