import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Space, Button } from 'antd';

import { DetailBot } from '../bot/detail';
import { getAllTransactions } from '../../store/transaction/transaction.action';
import { selectTransactions } from '../../store/transaction/transaction.selectors';
import { IBlockchain, IDex, IBot, ITransactionHistory, IBotStatistics } from '../../types';
import { formattedNumber } from '../../shared';
import moment from 'moment';

export const HistoryPage = () => {
  const dispatch = useDispatch();
  const histories = useSelector(selectTransactions);

  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<IBot | null>(null);

  useEffect(() => {
    dispatch(getAllTransactions());
  }, [dispatch]);

  const handleDetails = (history: ITransactionHistory) => {
    const bot: IBot = {
      ...history.bot,
      blockchain: history.blockchain,
      dex: history.dex,
      wallet: history.wallet,
      coin: history.coin,
      token: history.token
    };
    setSelectedBot(bot);
    setIsDetail(true);
  }

  const calculatePL = (buy?: IBotStatistics, sell?: IBotStatistics) => {
    const buyFee = buy ? buy.fee : 0;
    const sellFee = sell ? sell.fee : 0;

    return {
      coinAmount: (!buy || !sell) ? 0 : sell.coinAmount - buy.coinAmount,
      fee: buyFee + sellFee
    }
  }

  const columns = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Chain',
      dataIndex: 'blockchain',
      key: 'blockchain',
      render: (blockchain: IBlockchain) => (
        <div>{blockchain.name}</div>
      )
    },
    {
      title: 'DEX',
      dataIndex: 'dex',
      key: 'dex',
      render: (dex: IDex) => (
        <div>{dex.name}</div>
      )
    },
    {
      title: 'Bot',
      key: 'bot',
      render: (history: ITransactionHistory) => (
        <div>{history.coin?.symbol} - {history.token.symbol}</div>
      )
    },
    {
      title: 'P & L',
      dataIndex: 'bot',
      key: 'pl',
      render: (bot: IBot) => (
        <>
        {bot ? formattedNumber(calculatePL(bot.statistics?.buy, bot.statistics?.sell).coinAmount) : '---'}
        </>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created',
      key: 'date',
      render: (created: string) => (
        <div>{moment(created).format('HH:mm:ss MM-DD-YYYY')}</div>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (history: ITransactionHistory) => (
        <Space size="middle">
          <Button shape='round' onClick={()=>handleDetails(history)} disabled={history.bot ? false : true}>
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3 bg-gray-dark">
        <Table 
          columns={columns} 
          dataSource={histories} 
          rowKey="_id"
          pagination={{ position: ["bottomRight"] }}
          scroll={{ x: 1100 }}
        />
      </div>
      {isDetail && selectedBot && <DetailBot visible={isDetail} setVisible={setIsDetail} botId={selectedBot._id} />}
    </div>
  )
}