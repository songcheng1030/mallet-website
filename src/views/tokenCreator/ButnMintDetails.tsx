import { useEffect, useState } from "react"
import { Table, Space, Button } from 'antd';
import { useSelector } from 'react-redux';
import moment from "moment";
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { selectTokenCreators } from 'store/tokenCreator/tokenCreator.selectors';
import { selectElapsedTime } from "store/auth/auth.selectors";
import { reportService } from "services";
import { ITokenCreator, IBlockchain, ITokenCreatorState, IDex } from "types";
import { formattedNumber, shortenAddress } from 'shared';
import { CopyableLabel } from 'components/common/CopyableLabel';

interface Props {
  creatorId: string
}

export const ButnMintDetails = ({creatorId}: Props) => {
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

      reportService.getTokenMintBurnDetail(tokenCreator._id)
      .then(res => {
        setIsLoading(false);
        if (res && res.length > 0) {
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
          {dt}
        </Space>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: IDex) => (
        <Space>
          {amount}
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
    <div className="w-1/2">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        onChange={handleTableChange}
        // scroll={{x: 800}}
      />
    </div>
  )
}
