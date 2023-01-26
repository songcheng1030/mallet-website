import { useEffect, useState } from "react"
import { Table, Space, Button } from 'antd';
import { useSelector } from 'react-redux';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import moment from "moment";

import { selectTokenCreators } from 'store/tokenCreator/tokenCreator.selectors';
import { selectElapsedTime } from "store/auth/auth.selectors";
import { reportService } from "services";
import { ITokenCreator, IBlockchain, ITokenCreatorState, IDex } from "types";
import { formattedNumber, shortenAddress } from 'shared';
import { CopyableLabel } from 'components/common/CopyableLabel';

interface Props {
  creatorId: string
}

export const LPDetails = ({creatorId}: Props) => {
  const tokenCreators = useSelector(selectTokenCreators);
  const elapsedTime = useSelector(selectElapsedTime);

  const [tokenCreator, setTokenCreator] = useState<ITokenCreator>();
  const [data, setData] = useState<any>([]);
  const [flag, setFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (creatorId) {
      const creator = tokenCreators.find(el => el._id === creatorId);
      setTokenCreator(creator);
    }
  }, [creatorId, tokenCreators]);

  useEffect(() => {
    if (!tokenCreator?._id) return;
    if (!flag) {
      setIsLoading(true);
    }
    
    if ((elapsedTime) % 5 === 0) {
      setFlag(true);

      reportService.getLiquidityPoolDetail(tokenCreator._id)
      .then(res => {
        setIsLoading(false);
        if (res && res.length > 0) {
          console.log("res",res)
          setData(res);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.log("error", err);
      });
    }
  }, [elapsedTime, tokenCreator?._id]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
  ) => {
    setPage(pagination.current ? pagination.current : 1);
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{data.length - ((page-1) * 10 + index)}</>)
    },
    {
      title: 'Date',
      dataIndex: 'created',
      key: 'date',
      render: (date: string) => (
        <Space>{moment(date).format('HH:MM:SS MM-DD-YYYY')}</Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'tyep',
      render: (dt: string) => (
        <Space className='text-green'>
          {dt === 'ADD_LP' ? 'ADD' : 'REMOVE'}
        </Space>
      )
    },
    {
      title: 'DEX',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <Space>
          {dex.name}
        </Space>
      )
    },
    {
      title: 'Base Coin',
      dataIndex: 'baseCoin',
      key: 'baseCoin',
      render: (baseCoin: {amount: string, symbol: string}) => (
        <Space>
          <span>{formattedNumber(Number(baseCoin.amount))}</span>
          <span>{baseCoin.symbol}</span>
        </Space>
      )
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (token: {amount: string, symbol: string}) => (
        <Space>
          <span>{formattedNumber(Number(token.amount))}</span>
          <span>{token.symbol}</span>
        </Space>
      )
    },
    {
      title: 'Transaction',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (txHash: string) => (
        <Space>
          <a
            href={`${tokenCreator?.blockchain.explorer}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(txHash)}
          </a>
          <CopyableLabel value={txHash} label="" />
        </Space>
      )
    }
  ];

  return (
    <div className="w-1/2 mr-2">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        onChange={handleTableChange}
        // scroll={{x: 600}}
      />
    </div>
  )
}
