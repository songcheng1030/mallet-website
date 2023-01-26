import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, Button, Modal, Input, Row, Col } from 'antd';

import { CardView } from './CardView';
import { ListView } from './ListView';
import { EditBot } from './edit';
import { getAllBlockchain, getAllNode, getAllDex, getAllCoin } from '../../store/network/network.action';
import { loadMyWallet } from '../../store/wallet/wallet.actions';
import { selectBots, selectTotal } from '../../store/bot/bot.selectors';
import { searchBots } from '../../store/bot/bot.actions';
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { BotFilter, ERunningStatus, ETradingInitiator } from 'types';
import { selectBlockchains } from '../../store/network/network.selectors';

const { Search } = Input;

export const BotPage = () => {
  const dispatch = useDispatch();
  
  const [selectedView, setSelectedView] = useState<string>('list');
  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isOnlyBuy, setIsOnlyBuy] = useState<boolean>(false);
  const [tradingMode, setTradingMode] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<ERunningStatus | ''>('');
  const [filter, setFilter] = useState<BotFilter>({
    initiator: ETradingInitiator.BOT,
    state: '',
    chain: '',
    tokenAddress: '',
    uniqueNum: -1,
    page: 1,
    pageLength: 10
  });
  
  const { Option } = Select;
  let botList = useSelector(selectBots);
  const total = useSelector(selectTotal);
  const elapsedTime = useSelector(selectElapsedTime);
  const chainData = useSelector(selectBlockchains);

  useEffect(() => {
    dispatch(getAllBlockchain());
    dispatch(getAllNode());
    dispatch(getAllCoin());
    dispatch(getAllDex());
    dispatch(loadMyWallet());
  }, [dispatch]);

  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);

    if ((elapsedTime - initTime) % 3 === 0) {
      dispatch(searchBots({
        ...filter,
        state: selectedTab
      }));
    }
  }, [elapsedTime, dispatch, flag, initTime, selectedTab, filter]);

  const handleChange = (value: string) => {
    setSelectedView(value);
    setFilter({
      ...filter,
      page: 1,
      pageLength: value === 'card' ? 9 : 10
    });
  }

  const setPage = (page: number) => {
    setFilter({
      ...filter,
      page: page
    });
  }
  
  return (
    <div className="rounded-lg bg-gray-dark py-2 px-5">
      <div className="p-2 my-3 flex justify-between items-center w-full">
        <Row gutter={16} className="flex-1 bg-gray-darkest px-3 py-3">
          <Col span={7}>
            <div className='flex items-center'>
              <div className='mr-3 whitespace-nowrap'>Bot Number:</div>
              <Search 
                placeholder="input bot number" 
                type="number"
                onSearch={(value)=>setFilter({...filter, uniqueNum: Number(value)})}
                className="w-full"
              />
            </div>
          </Col>
          <Col span={7}>
            <div className='flex items-center'>
              <div className='mr-3'>Chain:</div>
              <Select className='flex-1' defaultValue={filter.chain} onChange={(value: string)=>setFilter({...filter, chain: value})}>
                <Option value="">All</Option>
                {chainData.map((el, idx) => (
                  <Option value={el._id} key={idx}>
                    {el.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col span={10}>
            <div className='flex items-center'>
              <div className='mr-3 whitespace-nowrap'>Token Address:</div>
              <Search 
                placeholder="input token address" 
                onSearch={(value)=>setFilter({...filter, tokenAddress: value})}
                className="flex-1"
              />
            </div>
          </Col>
        </Row>
      </div>

      <div className="flex justify-center items-center relative">
        <div className="flex absolute right-0 top-2 z-50">
          <Button
            type='primary'  
            // icon={<PlusCircleOutlined />}
            onClick={()=>setTradingMode(true)}
          >
            Add New
          </Button>
          <Select defaultValue="list" className="w-28 ml-2" onChange={handleChange}>
            <Option value="list">List View</Option>
            <Option value="card">Card View</Option>
          </Select>
        </div>
      </div>
      <div className="">
        {selectedView === 'card' && 
          <CardView 
            data={botList}
            total={total}
            setPage={setPage}
            setSelectedTab={setSelectedTab}
          />
        }
        {selectedView === 'list' && 
          <ListView 
            data={botList}
            total={total}
            setPage={setPage}
            setSelectedTab={setSelectedTab}
          />
        }
      </div>
      {visible && <EditBot visible={visible} setVisible={setVisible} isEdit={false} onlyBuy={isOnlyBuy} />}
      {tradingMode && <Modal
          visible={tradingMode}
          title="Sniping Strategy"
          onCancel={()=>setTradingMode(false)}
          footer={[
            <div className='w-full flex justify-center'>
              <Button className='bg-gray-dark mr-10' key="buy" onClick={()=>{setIsOnlyBuy(true); setVisible(true); setTradingMode(false);}}>
                Buy Only
              </Button>
              <Button
                className='bg-gray-dark'
                key="buy_sell"
                onClick={()=>{setIsOnlyBuy(false); setVisible(true); setTradingMode(false);}}
              >
                Buy & Sell
              </Button>
            </div>
          ]}
        >
          <p className='my-5 text-center text-base'>Please select sniping strategy</p>
        </Modal>}
    </div>
  )
}
