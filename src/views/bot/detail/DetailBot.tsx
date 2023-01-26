import { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Table, Tabs, Input, Spin, Space, Checkbox } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import TradingView from '../../monitor/TradingView';
import { CopyableLabel } from '../../../components/common/CopyableLabel';
import { ViewItem } from '../../../components/common/ViewItem';
import { IBot, ITokenDetailReqDto, ITokenDetailDto, IBotHistory, ETradingThread, IBotTradingRequest, IBotStatistics } from '../../../types';
import { shortenAddress } from '../../../shared';
import { botService, tokenService } from '../../../services';
import { startBot, stopBot } from "../../../store/bot/bot.actions";
import TimeCounter from '../TimeCounter';
import { formattedNumber } from "../../../shared";
import { tradingTxt, runningColorTxt } from '../../../types';
import { selectBots } from 'store/bot/bot.selectors';

interface Props {
  botId: string;
  visible: boolean;
  botName?: string;
  setVisible: (visible: boolean) => void;
}

export const DetailBot = (props: Props) => {
  const { botId, botName, visible, setVisible } = props;
  const dispatch = useDispatch();
  const { TabPane } = Tabs;
  const { TextArea } = Input;
  const botList = useSelector(selectBots);

  const [logs, setLogs] = useState<string>("");
  const [histories, setHistories] = useState<IBotHistory[]>([]);
  const [tokenInfo, setTokenInfo] = useState<ITokenDetailDto | null>(null);
  const [tradingView, setTradingView] = useState<boolean>(false);
  const [bot, setBot] = useState<IBot | null>(null);

  useEffect(() => {
    if(visible) {
      const selectedBot = botList.find(el => el._id === botId);
      if (selectedBot) {
        setBot(selectedBot);

        const payload: ITokenDetailReqDto = {
          blockchainId: selectedBot.blockchain._id,
          nodeId: selectedBot.node._id,
          dexId: selectedBot.dex._id,
          tokenAddress: selectedBot.token.address,
          walletId: selectedBot.wallet._id,
          netCoin: true,
          coinAddress: selectedBot.coin.address
        };
  
        let mounted = true;
        tokenService.getTokenDetail(payload)
        .then(res => {
          if (res && mounted) {
            setTokenInfo(res);
          } else {
          }
        })
        .catch(err => {
        });
  
        botService.getBotLog(selectedBot._id)
        .then(res => setLogs(res.data))
        .catch(err => setLogs(err));
  
        botService.getBotHistory(selectedBot._id)
        .then(res => {
          if (mounted) {
            setHistories(res.data);
          }
        })
        .catch(err => {});
      }
    }
  }, [botId, visible, botList]);

  const handleCancel = () => {
    setVisible(false);
  }

  const handleActive = () => {
    if (!bot) return;
    const payload: IBotTradingRequest = {
      botId: bot._id,
      type: bot.type,
      active: !bot.state.active
    };

    if (bot.state.active) {
      dispatch(stopBot(payload));
    } else {
      dispatch(startBot(payload));
    }
  }

  const handleCodeRed = () => {
    if (!bot) return;
    const payload: IBotTradingRequest = {
      botId: bot._id,
      type: bot.type,
      active: !bot.state.extends?.instant?.active,
      thread: ETradingThread.SELLING_INSTANT
    };

    dispatch(startBot(payload));
  }

  const handleSpamSell = () => {
    if (!bot) return;
    const payload: IBotTradingRequest = {
      botId: bot._id,
      type: bot.type,
      active: !bot.state.extends?.instant?.active,
      thread: ETradingThread.SELLING_SPAM
    };

    dispatch(startBot(payload));
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
      key: 'index',
      width: 60,
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Type',
      dataIndex: 'thread',
      key: 'thread',
      render: (type: ETradingThread) => (
        <div>{tradingTxt[type] ? tradingTxt[type] : type}</div>
      )
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      width: 100
    },
    {
      title: 'TxHash',
      key: 'txHash',
      width: 160,
      render: (history: IBotHistory) => (
        <Space>
          {history.txHash ? (
            <>
            <a 
              href={`${history.blockchain.explorer}/tx/${history.txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortenAddress(history.txHash)}
            </a>
            <CopyableLabel value={history.txHash} label=""/>
            </>
          ) : ''}
        </Space>
      )
    },
    {
      title: `Coin Amount [${bot?.coin.symbol}]`,
      dataIndex: 'coinAmount',
      key: 'coinAmount',
      render: (value: number) => (
        <>
        {formattedNumber(value)}
        </>
      )
    },
    {
      title: `Token Amount [${bot?.token.symbol}]`,
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      render: (value: number) => (
        <>
        {formattedNumber(value)}
        </>
      )
    },
    {
      title: 'Ranking',
      dataIndex: 'message',
      key: 'ranking',
      width: 100
    },
    {
      title: 'Try Count',
      dataIndex: 'tryCount',
      key: 'tryCount',
      width: 100,
    },
    {
      title: 'Gas Fee [GWEI]',
      dataIndex: 'gasFee',
      key: 'gasFee',
      render: (value: number) => (
        <>
        {formattedNumber(value)}
        </>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created',
      key: 'created',
      render: (value: string) => (
        <div>{moment(value).format('HH:mm:ss MM-DD-YYYY').toString()}</div>
      )
    },
  ];
  
  return (
    <>
    {bot && (
      <Modal
        title={
          <div className='flex'>
          {botName && <span className='flex-1'>{botName}</span>}
          <span className='flex-1'>{`${bot.coin.symbol} - ${bot.token.symbol}`}</span>
          </div>
        }
        centered
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <div className='flex justify-between w-full'>
            <div className='flex items-center'>
              <div className='flex items-center mr-10'>
                <div className={`mr-2 w-3 h-3 rounded ${runningColorTxt[bot.state.status]}`} />
                <div>{bot.state.status}</div>
              </div>
              <div className='mr-10'>{`${tradingTxt[bot.state.thread] ? tradingTxt[bot.state.thread] : bot.state.thread} : ${bot.state.result}`}</div>
              {bot.state.active && (
                <div>
                  {bot.buy?.startTime && <TimeCounter criteriaTime={bot.buy?.startTime} isBuy={true} />}
                </div>
              )}
            </div>
            <div>
              <Checkbox key="chart" className='mr-6' checked={tradingView} onChange={(e) => setTradingView(e.target.checked)}>
                CHART
              </Checkbox>
              <Button type='primary' key="start" onClick={handleActive} danger={bot.state.active}>
                {bot.state.active ? 'STOP' : 'START'}
              </Button>
              <Button 
                type='primary' 
                key="code" 
                onClick={handleCodeRed} 
                danger={bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread === ETradingThread.SELLING_INSTANT}
                disabled={bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread !== ETradingThread.SELLING_INSTANT}
              >
                <span>{(bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread === ETradingThread.SELLING_INSTANT) ? 'SELLING' : 'CODE RED'}</span>
              </Button>
              <Button 
                type='primary' 
                key="spam" 
                onClick={handleSpamSell} 
                danger={bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread === ETradingThread.SELLING_SPAM}
                disabled={bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread !== ETradingThread.SELLING_SPAM}
              >
                <span>{(bot.state.extends?.instant?.active && bot.state.extends?.instant?.thread === ETradingThread.SELLING_SPAM) ? 'SELLING' : 'SPAM SELL'}</span>
              </Button>
              <Button key="close" onClick={handleCancel}>
                CLOSE
              </Button>
            </div>
          </div>
        ]}
        width={1600}
        maskClosable={false}
      >
        <Row gutter={8}>
          <Col md={10}>
            <Card
              title={<span className='text-blue-dark'>Bot Informations</span>}
              className="w-full h-full border border-solid border-blue-dark"
            >
              <Row gutter={4} className='mb-5'>
                <Col md={12}>
                  <ViewItem name="Blockchain" value={bot.blockchain.name} />
                </Col>
                <Col md={12}>
                  <ViewItem name="Node" value={bot.node.name} />
                </Col>
                <Col md={12}>
                  <ViewItem name="DEX" value={bot.dex.name} />
                </Col>
                <Col md={12}>
                  <ViewItem name="Wallet" value={bot.wallet.name} />
                </Col>
                <Col md={12}>
                  <ViewItem 
                    name="Token Address" 
                    value={shortenAddress(bot.token.address)} 
                    copy={bot.token.address} 
                    link={`${bot.blockchain.explorer}/address/${bot.token.address}`}
                  />
                </Col>
              </Row>

              {bot.buy && (
                <Row gutter={2} className='mb-5'>
                  <Col md={12}>
                    <ViewItem name="Buy Type" value={bot.buy?.type} />
                  </Col>
                  <Col md={12}>
                    <ViewItem 
                      name="Amount" 
                      value={formattedNumber(bot.buy.amount)}
                      sufUnit={bot.coin.symbol}
                    />
                  </Col>
                  <Col md={12}>
                    <ViewItem name="Gas Price" value={bot.buy.gasPrice} sufUnit='GWEI' />
                  </Col>
                  {bot.buy?.type === 'SPAM' && (
                    <Col md={12}>
                      {bot.buy.startTime && <ViewItem name="Start Time" value={moment(bot.buy.startTime).format('HH:mm:ss MM-DD-YYYY').toString()} />}
                    </Col>
                  )}
                </Row>
              )}

              {bot.sell && (
                <Row gutter={2} className='mb-5'>
                  <Col md={12}>
                    <ViewItem name="Sell Type" value={bot.sell.type} />
                  </Col>
                  {/* <Col md={12}>
                    <ViewItem name="Gas Price" value={bot.sell.gasPrice} sufUnit='GWEI' />
                  </Col> */}
                  {bot.config?.stopLoss && (
                    <Col md={12}>
                      <ViewItem name="Stop Loss" value={bot.config.stopLimit} sufUnit='%' />
                    </Col>
                  )}
                  {bot.config?.savings && (
                    <Col md={12}>
                      <ViewItem name="Savings" value={bot.config.saveLimit} sufUnit='%' />
                    </Col>
                  )}
                  {bot.config?.rugpool && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={8} className='text-gray'> Rugpool </Col>
                        <Col span={16} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                  {bot.config?.antiSell && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={8} className='text-gray'> Anti-Sell </Col>
                        <Col span={16} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                  {bot.config?.buyLimitDetected && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={16} className='text-gray'> Buy Limit Detected </Col>
                        <Col span={8} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                  {bot.config?.sellLimitDetected && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={16} className='text-gray'> Sell Limit Detected </Col>
                        <Col span={8} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                  {bot.config?.autoBuyAmount && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={16} className='text-gray'> Auto Buy Amount </Col>
                        <Col span={8} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                  {bot.config?.buyAnyCost && (
                    <Col md={12}>
                      <Row gutter={2}>
                        <Col span={16} className='text-gray'> Buy Any Cost </Col>
                        <Col span={8} className='text-green'><CheckOutlined /></Col>
                      </Row>
                    </Col>
                  )}
                </Row>
              )}
            </Card>
          </Col>
          <Col md={6}>
            <Card
              title={<span className='text-green-dark'>Wallet Informations</span>}
              className="w-full h-full border border-solid border-green-dark"
            >
              {tokenInfo ? (
                <Row gutter={4} className='mb-5'>
                  <Col md={24}>
                    <ViewItem 
                      name="Address" 
                      value={shortenAddress(bot.wallet.publicKey)} 
                      copy={bot.wallet.publicKey}
                      link={`${bot.blockchain.explorer}/address/${bot.wallet.publicKey}`}
                    />
                  </Col>

                  {tokenInfo.coin && (
                    <>
                      <Col md={24}>
                        <ViewItem name={tokenInfo.netCoin?.symbol? tokenInfo.netCoin?.symbol : ''} value={tokenInfo.netCoin?.balance.toFixed(4)} />
                      </Col>
                      <Col md={24}>
                        <ViewItem 
                          name={tokenInfo.coin?.symbol? tokenInfo.coin.symbol : ''} 
                          value={tokenInfo.coin.balance?.toFixed(4)} 
                          sufUnit={`(${bot.coin.decimals} decimals)`} 
                        />
                      </Col>
                    </>
                  )}
                  
                  <Col md={24}>
                    <ViewItem 
                      name={tokenInfo.token?.symbol? tokenInfo.token.symbol : ''} 
                      value={formattedNumber(tokenInfo.token?.balance)}
                      sufUnit={`(${bot.token.decimals} decimals)`}
                    />
                  </Col>
                </Row>
              ) : (
                <div className='w-full h-full flex justify-center items-center'>
                  <Spin tip="Loading..."></Spin>
                </div>
              )}
            </Card>
          </Col>
          {!tradingView && (
            <Col md={8}>
              <Card
                title={<span className='text-yellow-light'>Result</span>}
                className="w-full h-full border border-solid border-yellow-light"
              >
                <Row gutter={4} className='mb-5'>
                  <Col md={24}>
                    <ViewItem 
                      name="Bought" 
                      value={`${formattedNumber(bot.statistics?.buy?.coinAmount)} ${bot.coin.symbol} / ${formattedNumber(bot.statistics?.buy?.tokenAmount)} ${bot.token.symbol}`}
                    />
                    <ViewItem 
                      name="Sold" 
                      value={`${formattedNumber(bot.statistics?.sell?.coinAmount)} ${bot.coin.symbol} / ${formattedNumber(bot.statistics?.sell?.tokenAmount)} ${bot.token.symbol}`}
                    />
                    <ViewItem 
                      name="P & L" 
                      value={formattedNumber(calculatePL(bot.statistics?.buy, bot.statistics?.sell).coinAmount)}
                      sufUnit={bot.coin.symbol}
                    />
                    <ViewItem 
                      name="Gas Fees" 
                      value={formattedNumber(calculatePL(bot.statistics?.buy, bot.statistics?.sell).fee)}
                      sufUnit={bot.blockchain.coinSymbol}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          )}
          {tradingView && (
            <Col md={8}>
              <div className='h-full flex flex-col justify-between'>
                <div className='w-full flex-1'>
                  <TradingView />
                </div>
              </div>
            </Col>
          )}
        </Row>
        <Row className='h-96'>
          <Col md={24}>
            <Tabs>
              <TabPane 
                tab="History"
                key="history"
              >
                <Table 
                  bordered
                  columns={columns} 
                  dataSource={histories} 
                  size="small" 
                  pagination={false} 
                  rowKey="_id" 
                  scroll={{ x: 1100, y: 300 }}
                />
              </TabPane>
              <TabPane 
                tab="Logs"
                key="logs"
              >
                <TextArea
                  value={logs}
                  autoSize={{ minRows: 15, maxRows: 15 }}
                  placeholder="Console"
                  readOnly
                />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Modal>
    )}
    </>
  )
}
