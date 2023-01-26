import { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Card, Spin, Tabs, Input, Table, Space } from 'antd';
import { useDispatch } from "react-redux";
import Web3 from 'web3';
import moment from 'moment-timezone';
import BigNumber from "bignumber.js";

import { botService, tokenService } from '../../../services';
// import { showNotification } from "../../../shared";
import { IAutoBot, ITokenDetailDto, ITokenDetailReqDto, IBotHistory, ETradingThread, IBotStatistics } from '../../../types';
import { ViewItem } from '../../../components/common/ViewItem';
import { shortenAddress, formattedNumber } from '../../../shared';
import { tradingTxt } from '../../../types';
import { CopyableLabel } from '../../../components/common/CopyableLabel';
const erc20ABI = require("shared/erc20.json");

const { TextArea } = Input;
const { TabPane } = Tabs;

interface Props {
  botId: string,
}

export const AutoBotDetails = (props: Props) => {
  const dispatch = useDispatch();
  const {botId} = props;
  
  const [visible, setVisible] = useState<boolean>(false);
  const [bot, setBot] = useState<IAutoBot | null>(null);
  const [tokenInfo, setTokenInfo] = useState<ITokenDetailDto | null>(null);
  const [histories, setHistories] = useState<IBotHistory[]>([]);
  const [logs, setLogs] = useState<string>("");
  const [isWithdraw, setIsWithdraw] = useState<boolean>(false);
  const [subWalletInfo, setSubWalletInfo] = useState<any | null>(null);

  useEffect(() => {
    if (visible) {
      botService.getAutoBotById(botId)
      .then(res => {
        setBot(res);
      })
      .catch(err => {
      });

      botService.getAutoBotLog(botId)
      .then(res => setLogs(res.data))
      .catch(err => setLogs(err));

      botService.getAutoBotHistory(botId)
      .then(res => {
        setHistories(res.data);
      })
      .catch(err => {});
    }
  }, [dispatch, botId, visible]);

  useEffect(() => {
    if (!bot) return;
    const payload: ITokenDetailReqDto = {
      blockchainId: bot.blockchain._id,
      nodeId: bot.node._id,
      dexId: bot.dex._id,
      tokenAddress: bot.token.address,
      walletId: bot.mainWallet._id,
      netCoin: true,
      coinAddress: bot.coin.address
    };

    tokenService.getTokenDetail(payload)
    .then(res => {
      if (res) {
        setTokenInfo(res);
      } else {
      }
    })
    .catch(err => {
    });

    // fetch sub wallet info
    getSubWalletInfo(bot).then(res => {
      setSubWalletInfo(res);
    });
  }, [bot]);

  const getSubWalletInfo = async (bot: IAutoBot) => {
    if (!bot.walletAddress) return;
    const web3Client = new Web3(bot.node.rpcProviderURL);
    const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, bot.token.address)
    const tokenBalance = await tokenErc20Contract.methods.balanceOf(bot.walletAddress).call();

    const mainCoinBalance = await web3Client.eth.getBalance(bot.walletAddress);

    const coinErc20Contract = new web3Client.eth.Contract(erc20ABI, bot.coin.address);
    const baseCoinBalance = await coinErc20Contract.methods.balanceOf(bot.walletAddress).call();

    return {
      mainCoinBalance: new BigNumber(mainCoinBalance).shiftedBy(-18).toNumber(),
      baseCoinBalance: bot.coin.decimals && new BigNumber(baseCoinBalance).shiftedBy(-bot.coin.decimals).toNumber(),
      tokenBalance: bot.token.decimals && new BigNumber(tokenBalance).shiftedBy(-bot.token.decimals).toNumber(),
    };
  }

  const handleWithdraw = () => {
    if (!bot) return;
    setIsWithdraw(true);
    botService.withdrawAutoBotWallet(bot._id)
    .then(res => {
      setIsWithdraw(false);
    })
    .catch(error => {
      console.log(error);
      setIsWithdraw(false);
    });
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
      width: 200,
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
      // width: 160,
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
        <div>{moment(value).format('HH:mm:ss MM-DD-YYYY')}</div>
      )
    },
  ];

  return (
    <>
    <Button onClick={() => setVisible(true)} shape='round'>
      {/* <EyeOutlined /> */}
      Details
    </Button>
    <Modal
      title="Auto Bot Details"
      visible={visible}
      width={1600}
      onOk={() => setVisible(false)}
      onCancel={() => setVisible(false)}
    >
      {bot && (
        <>
        <Row gutter={8}>
          <Col md={6}>
            <Card
              title={<span className='text-blue-dark'>Bot Informations</span>}
              className="w-full h-full border border-solid border-blue-dark"
            >
              <Row gutter={4} className='mb-5'>
                <Col md={24}>
                  <ViewItem name="Blockchain" value={bot.blockchain.name} />
                </Col>
                <Col md={24}>
                  <ViewItem name="Node" value={bot.node.name} />
                </Col>
                <Col md={24}>
                  <ViewItem name="DEX" value={bot.dex.name} />
                </Col>
                <Col md={24}>
                  <ViewItem name="Wallet" value={bot.mainWallet.name} />
                </Col>
                <Col md={24}>
                  <ViewItem 
                    name="Token Address" 
                    value={shortenAddress(bot.token.address)} 
                    copy={bot.token.address} 
                    link={`${bot.blockchain.explorer}/address/${bot.token.address}`}
                  />
                </Col>
                <Col md={24}>
                  <ViewItem name="Buy Amount" value={bot.buyAmount} sufUnit={bot.coin.symbol} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col md={6}>
            <Card
              title={<span className='text-green-dark'>Main Wallet Informations</span>}
              className="w-full h-full border border-solid border-green-dark"
            >
              {tokenInfo ? (
                <Row gutter={4} className='mb-5'>
                  <Col md={24}>
                    <ViewItem 
                      name="Address" 
                      value={shortenAddress(bot.mainWallet.publicKey)} 
                      copy={bot.mainWallet.publicKey}
                      link={`${bot.blockchain.explorer}/address/${bot.mainWallet.publicKey}`}
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

          <Col md={6}>
            <Card
              title={<span className='text-yellow-light'>Sub Wallet Informations</span>}
              className="w-full h-full border border-solid border-yellow-light"
            >
              {tokenInfo && subWalletInfo ? (
                <Row gutter={4} className='mb-5'>
                  {bot.walletAddress && (
                    <Col md={24}>
                      <ViewItem 
                        name="Address" 
                        value={shortenAddress(bot.walletAddress)} 
                        copy={bot.walletAddress}
                        link={`${bot.blockchain.explorer}/address/${bot.walletAddress}`}
                      />
                    </Col>
                  )}

                  {tokenInfo.coin && (
                    <>
                      <Col md={24}>
                        <ViewItem name={tokenInfo.netCoin?.symbol? tokenInfo.netCoin?.symbol : ''} value={subWalletInfo.mainCoinBalance.toFixed(4)} />
                      </Col>
                      <Col md={24}>
                        <ViewItem 
                          name={tokenInfo.coin?.symbol? tokenInfo.coin.symbol : ''} 
                          value={subWalletInfo.baseCoinBalance.toFixed(4)} 
                          sufUnit={`(${bot.coin.decimals} decimals)`} 
                        />
                      </Col>
                    </>
                  )}
                  
                  <Col md={24}>
                    <ViewItem 
                      name={tokenInfo.token?.symbol? tokenInfo.token.symbol : ''} 
                      value={formattedNumber(subWalletInfo.tokenBalance)}
                      sufUnit={`(${bot.token.decimals} decimals)`}
                    />
                  </Col>

                  {/* {(subWalletInfo.baseCoinBalance !== 0 || subWalletInfo.mainCoinBalance !== 0) && ( */}
                    <Col md={24} className="mt-3">
                      <Button
                        type='primary' 
                        onClick={handleWithdraw}
                        loading={isWithdraw}
                        danger
                      >
                        Withdraw
                      </Button>
                    </Col>
                  {/* )} */}
                </Row>
              ) : (
                <div className='w-full h-full flex justify-center items-center'>
                  <Spin tip="Loading..."></Spin>
                </div>
              )}
            </Card>
          </Col>

          <Col md={6}>
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
                  scroll={{ x: 1100, y: 280 }}
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
        </>
      )}
    </Modal>
    </>
  )
}
