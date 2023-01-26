import { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { searchTokenCreators, deleteTokenCreator } from 'store/tokenCreator/tokenCreator.actions';
import { getAllBlockchain, getAllCoin } from 'store/network/network.action';
import { getAllDex } from 'store/network/network.action';
import { loadMyWallet } from 'store/wallet/wallet.actions';
import { loadMyCexAccounts } from 'store/cexAccount/cexAccount.actions';
import { selectTokenCreators, selectTotal } from 'store/tokenCreator/tokenCreator.selectors';
import { NewToken } from './modals/NewToken';
import { IBlockchain, TokenCreatorFilter, ITokenCreator, ITokenCreatorState } from 'types';
import { AddLiquidity } from './modals/AddLiquidity';
import { ActionModal } from './modals/ActionModal';
import { selectElapsedTime } from "store/auth/auth.selectors";
import { formattedNumber, shortenAddress } from '../../shared';
import TotalSupply from './TotalSupply';
import { CopyableLabel } from 'components/common/CopyableLabel';
import { ButnMintDetails } from './ButnMintDetails';
import { LPDetails } from './LPDetails';

export const TokenCreatorPage = () => {
  const [tokenModal, setTokenModal] = useState<boolean>(false);
  const [liquidityModal, setLiquidityModal] = useState<boolean>(false);
  const [actionModal, setActionModal] = useState<boolean>(false);
  // const [selected, setSelected] = useState<ITokenCreator>();
  const [actionType, setActionType] = useState<string>("");
  const [botId, setBotId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TokenCreatorFilter>({
    page: 1,
    pageLength: 10
  });

  const dispatch = useDispatch();
  const data = useSelector(selectTokenCreators);
  const total = useSelector(selectTotal);
  const elapsedTime = useSelector(selectElapsedTime);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllDex());
    dispatch(loadMyWallet());
    dispatch(loadMyCexAccounts());
    dispatch(getAllCoin())
  }, [dispatch]);

  useEffect(() => {
    if (elapsedTime % 3 === 0) {
      dispatch(searchTokenCreators(filter));
    }
  }, [dispatch, elapsedTime]);

  const handleDelete = (id: string) => {
    if (!id) {return;}
    dispatch(deleteTokenCreator(id));
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'uniqueNum',
      key: 'index',
      render: (index: number) => (
        <>{index ? index : 0}</>
      )
    },
    {
      title: 'Token Address',
      key: 'tokenAddress',
      render: (tokenCreator: ITokenCreator) => (<>
      {tokenCreator.token ? <Space>
        <a
          href={`${tokenCreator.blockchain.explorer}/address/${tokenCreator.token.address}`}
          target="_blank"
          rel="noreferrer"
        >
          {shortenAddress(tokenCreator.token.address)}
        </a>
        <CopyableLabel value={tokenCreator.token.address} label="" />
        </Space> : <div className='text-blue'>---</div>}
      </>
      )
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (dt: string) => (
        <Space className='text-green'>
          {dt}
        </Space>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Max Supply',
      key: 'maxSupply',
      render: (tokenCreator: ITokenCreator) => (
        <Space className='text-blue'>
          {formattedNumber(tokenCreator.maxSupply, 0)}
        </Space>
      )
    },
    {
      title: 'Total Supply',
      key: 'totalSupply',
      render: (tokenCreator: ITokenCreator) => (
        <>
          <TotalSupply tokenAddress={tokenCreator.token?.address} rpcurl={tokenCreator.node.rpcProviderURL} />
        </>
      )
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <Space>
          {blockchain.name}
        </Space>
      )
    },
    {
      title: 'Decimals',
      dataIndex: 'decimals',
      key: 'decimals',
      render: (dt: number) => (
        <Space className='text-blue'>
          {dt}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state: ITokenCreatorState) => (
        <Space>
          <span className='text-white'>{state.action}</span>
          <span className='text-yellow'>{state.result ? `:  ${state.result}` : ''}</span>
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 350,
      render: (tokenCreator: ITokenCreator) => (
        <Space>
          <Button
            shape="round"
            // type='primary'
            size={'small'}
            onClick={() => {
              // setSelected(tokenCreator);
              setActionType("Mint");
              setBotId(tokenCreator._id);
              setActionModal(true);
            }}
            disabled={tokenCreator.state.action.length > 0 && tokenCreator.state.result == ''}
            loading={tokenCreator.state.action == 'Minting' && tokenCreator.state.result == ''}
          >
            Mint
          </Button>
          <Button
            shape="round"
            // type='primary'
            size={'small'}
            onClick={() => {
              // setSelected(tokenCreator);
              setBotId(tokenCreator._id);
              setActionType("Burn");
              setActionModal(true);
            }}
            disabled={tokenCreator.state.action.length > 0 && tokenCreator.state.result == ''}
            loading={tokenCreator.state.action == 'Burning' && tokenCreator.state.result == ''}
          >
            Burn
          </Button>
          <Button
            shape="round"
            size={'small'}
            onClick={() => {
              // setSelected(tokenCreator);
              setBotId(tokenCreator._id);
              setLiquidityModal(true);
            }}
            disabled={tokenCreator.state.action.length > 0 && tokenCreator.state.result == ''}
            loading={(tokenCreator.state.action == 'Adding LP' || tokenCreator.state.action == 'Removing LP') && tokenCreator.state.result == ''}
          >
            Liquidity
          </Button>

          <Popconfirm
            placement="top"
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(tokenCreator._id)}
            okText="Yes"
            cancelText="No"
            key="delete"
          >
            <Button
              shape="round"
              type='primary'
              size={'small'}
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    // filters: any,
    // sorter: any,
  ) => {
    setFilter({
      page: pagination.current ? pagination.current : 1,
      pageLength: pagination.pageSize ? pagination.pageSize : 10
    });
  }

  return (
    <div className="bg-gray-dark rounded-md p-5">
      <div className="h-12 flex justify-center items-center">
        <div className="flex justify-between items-center w-full">
          <div className='w-full my-2 text-base text-blue'></div>
          <Button type="primary" onClick={()=>setTokenModal(true)}>
            Add New
          </Button>
        </div>
      </div>
      <div className="bg-gray-dark">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          onChange={handleTableChange}
          pagination={{total: total}}
          scroll={{x: 1400}}
          expandable={{
            expandedRowRender: record => (
              <div className='w-full flex'>
                <LPDetails creatorId={record._id} />
                <ButnMintDetails creatorId={record._id} />
              </div>
            ),
            rowExpandable: record => true
          }}
        />
      </div>
      {tokenModal && <NewToken visible={tokenModal} setVisible={setTokenModal} />}
      {liquidityModal && botId && <AddLiquidity 
        botId={botId} 
        visible={liquidityModal} 
        setVisible={setLiquidityModal} 
      />}
      {actionModal && botId !== null &&
        <ActionModal 
          botId={botId} 
          visible={actionModal} 
          setVisible={setActionModal} 
          type={actionType}    
        />}
    </div>
  )
}
