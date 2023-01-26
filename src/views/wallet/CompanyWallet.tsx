import { useState, useEffect } from 'react';
import { Button, Table, Space, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { loadCompanyWallets, deleteCompanyWallet } from '../../store/companyWallet/companyWallet.actions';
import { selectCompanyWallets } from "../../store/companyWallet/companyWallet.selectors";
import { selectBlockchains } from '../../store/network/network.selectors';
import { shortenAddress } from '../../shared';
import { CopyableLabel } from '../../components/common/CopyableLabel';
import { Balance } from './components/Balance';

export const CompanyWallet = () => {
  const dispatch = useDispatch();
  const companyWalletData = useSelector(selectCompanyWallets);
  const blockchainData = useSelector(selectBlockchains);
  const [columns, setColumns] = useState<any>([]);
  
  useEffect(() => {
    dispatch(loadCompanyWallets());
  }, [dispatch]);

  useEffect(() => {
    let tmp = [{
      title: '#',
      dataIndex: 'uniqueNum',
      key: 'index',
      // fixed: 'left',
      render: (index: number) => (<>{index}</>)
    },
    {
      title: 'Address',
      dataIndex: 'publicKey',
      key: 'address',
      // fixed: 'left',
      render: (address: string) => (
        <Space>
          <div>{shortenAddress(address)}</div>
          <CopyableLabel value={address} label=""/>
        </Space>
      )
    }];

    blockchainData.forEach(el => {
      const temp = {
        title: el.name,
        dataIndex: "publicKey",
        key: 'chainName',
        render: (address: string) => (
          <Balance
            address={address}
            rpc={el.node?.rpcProviderURL || ""}
            symbol={el.coinSymbol}
          />
        )
      };
      tmp.push(temp);
    });

    const temp = {
      title: 'Delete',
      dataIndex: "_id",
      key: 'action',
      render: (id: string) => (
        <Space size="middle">
          <Popconfirm placement="top" title="Are you sure you want to delete this wallet?" onConfirm={()=>handleDelete(id)} okText="Yes" cancelText="No">
            <Button type="primary" shape="round" icon={<DeleteOutlined />} size={'small'} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
    tmp.push(temp);

    setColumns(tmp);
  }, [blockchainData, companyWalletData]);

  const handleDelete = (id: string) => {
    dispatch(deleteCompanyWallet(id));
  }

  return (
    <>
      <Table 
        columns={columns}
        dataSource={companyWalletData}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 1200 }}
      />
    </>
  )
}
