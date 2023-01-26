import { useState, useMemo } from 'react';
import { Card, Button, Row, Col, Popconfirm, Menu, Dropdown } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, EditOutlined, EyeOutlined, DeleteOutlined, DisconnectOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import { ViewItem } from '../../components/common/ViewItem';
import { ERunningStatus, IBot, IBotTradingRequest, IBotUpdateRequest } from '../../types';
import { shortenAddress } from '../../shared';
import { DetailBot } from './detail';
import { startBot, stopBot, deleteBot, discardBot } from "../../store/bot/bot.actions";
import TimeCounter from './TimeCounter';
import { tradingTxt, runningColorTxt } from '../../types';
import moment from 'moment';

interface BotProps {
  item: IBot,
  setSelectedBot: (bot: IBot) => void,
  setVisible: (visible: boolean) => void,
  setIsDuplicate: (visible: boolean) => void,
}

const Bot = (props: BotProps) => {
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const { item, setSelectedBot, setVisible, setIsDuplicate } = props;
  const dispatch = useDispatch();

  const handleEdit = () => {
    setSelectedBot(item);
    setVisible(true);
  }

  const handleDetail = () => {
    setIsDetail(true);
  }

  const handleDuplicate = () => {
    setSelectedBot(item);
    setIsDuplicate(true);
    
  }

  const handleDelete = () => {
    dispatch(deleteBot(item._id));
  }

  const handleDiscard = () => {
    const temp: IBotUpdateRequest = {
      _id: item._id,
      state: {
        ...item.state,
        status: ERunningStatus.ARCHIVED
      },
    };
    dispatch(discardBot(temp));
  }

  const handleStart = () => {
    const payload: IBotTradingRequest = {
      botId: item._id,
      type: item.type,
      active: true
    };
    dispatch(startBot(payload));
  }

  const handleStop = () => {
    const payload: IBotTradingRequest = {
      botId: item._id,
      type: item.type,
      active: false
    };
    dispatch(stopBot(payload));
  }

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<EditOutlined />} disabled={item.state.active}>
        <div onClick={handleEdit}>Edit</div>
      </Menu.Item>
      <Menu.Item key="2" icon={<EyeOutlined />} >
        <div onClick={handleDetail}>Details</div>
      </Menu.Item>
      <Menu.Item key="3" icon={<CopyOutlined />}>
        <div onClick={handleDuplicate}>Duplicate</div>
      </Menu.Item>
      <Menu.Item key="4" icon={<DisconnectOutlined />} disabled={item.state.status === ERunningStatus.ARCHIVED}>
        <Popconfirm 
          placement="top" 
          title="Are you sure you want to discard this bot?" 
          onConfirm={handleDiscard} 
          okText="Yes" 
          cancelText="No"
          key="delete"
        >
          Archive
        </Popconfirm>
      </Menu.Item>
      <Menu.Item key="5" icon={<DeleteOutlined />}>
        <Popconfirm 
          placement="top" 
          title="Are you sure you want to delete this bot?" 
          onConfirm={handleDelete} 
          okText="Yes" 
          cancelText="No"
          key="delete"
        >
          Delete
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const onChangeBotNumber = useMemo(() => {
    const botUnique = item.uniqueNum ? item.uniqueNum : 0;
    const str = '0000' + botUnique;
    return str.slice(str.length - 4);
  }, [item.uniqueNum]);

  return (
    <Card 
      size="small" 
      title={<div className='flex justify-between'>
        <div>{`BOT ${onChangeBotNumber}`}</div>
        <div>{`${item.coin.symbol} - ${item.token.symbol}`}</div>
        <div className='flex items-center'>
          <div className={`mr-2 w-3 h-3 rounded ${runningColorTxt[item.state.status]}`} />
          <div>{item.state.status}</div>
        </div>
      </div>}
      className='relative'
    >
      <Row className='mt-2' gutter={2}>
        <Col md={24} className='border-0 border-b border-solid border-blue-dark mb-1'>
          <b className='text-blue-dark'>Main Info </b>
        </Col>
        <Col md={12}>
          <ViewItem name="Blockchain" value={item.blockchain.name} />
        </Col>
        <Col md={12}>
          <ViewItem name="Node" value={item.node.name} />
        </Col>
        <Col md={12}>
          <ViewItem name="DEX" value={item.dex.name} />
        </Col>
        <Col md={12}>
          <ViewItem 
            name="Token" 
            value={shortenAddress(item.token.address)} 
            copy={item.token.address}
            link={`${item.blockchain.explorer}/address/${item.token.address}`}
          />
        </Col>
        <Col md={12}>
          <ViewItem name="Wallet" value={item.wallet.name} />
        </Col>
      </Row>

      {item.buy && (
        <Row className="mt-3" gutter={2}>
          <Col md={24} className='border-0 border-b border-solid border-green-dark mb-1'>
            <b className='text-green-dark'>Buy Info</b>
          </Col>
          <Col md={12}>
            <ViewItem name="Buy Type" value={item.buy.type} />
          </Col>
          <Col md={12}>
            <ViewItem 
              name="Amount" 
              value={item.buy.amount}
              sufUnit={item.coin.symbol}
            />
          </Col>
          <Col md={12}>
            <ViewItem name="Gas Price" value={item.buy.gasPrice} sufUnit='GWEI' />
          </Col>
          {item.buy.type === 'SPAM' && (
            <Col md={12}>
              {item.buy.startTime && <ViewItem 
                name="Start Time" 
                value={moment(item.buy.startTime).format('HH:mm:ss MM-DD-YYYY').toString()}
              />}
            </Col>
          )}
        </Row>
      )}

      {item.sell && (
        <Row className="mt-3" gutter={2}>
          <Col md={24} className='border-0 border-b border-solid border-yellow-light mb-1'>
            <b className='text-yellow-light'>Sell Info</b>
          </Col>
          <Col md={12}>
            <ViewItem name="Sell Type" value={item.sell.type} />
          </Col>
          {/* <Col md={12}>
            <CardItem name="Gas Price" value={item.sell.gasPrice} sufUnit='GWEI' />
          </Col> */}
          {item.config?.stopLoss && (
            <Col md={12}>
              <ViewItem name="Stop Loss" value={item.config.stopLimit} sufUnit='%' />
            </Col>
          )}
          {item.config?.savings && (
            <Col md={12}>
              <ViewItem name="Savings" value={item.config.saveLimit} sufUnit='%' />
            </Col>
          )}
          {item.config?.rugpool && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={8} className='text-gray'> Rugpool </Col>
                <Col span={16} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
          {item.config?.antiSell && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={8} className='text-gray'> Anti-Sell </Col>
                <Col span={16} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
          {item.config?.buyLimitDetected && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={16} className='text-gray'> Buy Limit Detected </Col>
                <Col span={8} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
          {item.config?.sellLimitDetected && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={16} className='text-gray'> Sell Limit Detected </Col>
                <Col span={8} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
          {item.config?.autoBuyAmount && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={16} className='text-gray'> Auto Buy Amount </Col>
                <Col span={8} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
          {item.config?.buyAnyCost && (
            <Col md={12}>
              <Row gutter={2}>
                <Col span={16} className='text-gray'> Buy Any Cost </Col>
                <Col span={8} className='text-green'><CheckOutlined /></Col>
              </Row>
            </Col>
          )}
        </Row>
      )}

      <div className='mb-16'></div>

      <div className='absolute bottom-0 left-0 flex justify-between items-center border-0 border-t border-gray-dark border-solid p-3 w-full'>
        <div>
          {`${tradingTxt[item.state.thread] ? tradingTxt[item.state.thread] : item.state.thread} : ${item.state.result}`}
        </div>
        <div className='flex'>
          {!item.state.active && item.state.status !== ERunningStatus.ARCHIVED && (
            <Button 
              type='primary'
              className='mr-2'
              size='small'
              icon={<PlayCircleOutlined />}
              onClick={handleStart}
            >
              Start
            </Button>
          )}
          
          {item.state.active && (
            <>
              <div className='text-md mr-2'>
                {item.buy?.startTime && <TimeCounter criteriaTime={item.buy?.startTime} isBuy={true} />}
              </div>
              <Button 
                type='primary'
                danger
                size='small'
                className='mr-2'
                icon={<PauseCircleOutlined />}
                onClick={handleStop}
              >
                Stop
              </Button>
            </>
          )}
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <Button size='small' >...</Button>
          </Dropdown>
        </div>
      </div>
      {isDetail && <DetailBot visible={isDetail} setVisible={setIsDetail} botId={item._id} botName={`BOT ${onChangeBotNumber}`} />}
    </Card>
  );
}

export default Bot;
