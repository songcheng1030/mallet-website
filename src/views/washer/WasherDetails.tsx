import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { Row, Col, Table, Spin } from "antd";
import moment from "moment";
import { Area } from '@ant-design/plots';
import { TablePaginationConfig } from 'antd/lib/table/interface';

import { formattedNumber } from "shared";
import { reportService, coinMarketService } from "services";
import { IWasherTransaction, IWasherBot, ICoinMarketVolume } from "types";
import { selectElapsedTime } from "store/auth/auth.selectors";
import { selectWasherBots } from "store/washerBot/washerBot.selectors";

interface Props {
  washerId?: string;
}

export const WasherDetails = (props: Props) => {
  const { washerId } = props;
  const [washer, setWasher] = useState<IWasherBot>();
  const [data, setData] = useState<IWasherTransaction[]>([]);
  const [volumeData, setVolumeData] = useState<ICoinMarketVolume[]>([]);
  // const [sortedData, setSortedData] = useState<any>([]);
  const [flag, setFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const elapsedTime = useSelector(selectElapsedTime);
  const washerBots = useSelector(selectWasherBots);

  useEffect(() => {
    if (washerId) {
      const curBot = washerBots.find(el => el._id === washerId);
      setWasher(curBot);
    }
  }, [washerId, washerBots]);

  const getCMCVolume = () => {
    if (washer?.token._id) {
      coinMarketService.getAll(washer.token._id)
      .then(res => {
        if (res?.length) {
          const temp = res.map(el => {
            return {
              ...el,
              date: moment.utc(el.timestamp).format('DD/MM/YYYY')
            };
          });
          setVolumeData(temp);
        }
      })
      .catch(err => console.log(err));
    }
  }

  useEffect(() => {
    if (!washer?._id) return;
    if (!flag) {
      setIsLoading(true);
    }
    
    if ((elapsedTime) % 5 === 0) {
      setFlag(true);
      getCMCVolume();

      reportService.getWasherDetail(washer._id)
      .then(res => {
        setIsLoading(false);
        if (res && res.length > 0) {
          const temp = res.map(el => {
            const dailyVolume = volumeData.find(volume => volume.date === el.date);
            return {
              ...el,
              coinmarketVolume: dailyVolume? dailyVolume.volume : 0
            };
          });
          setData(temp);
          // let _res = res.reverse();
          // setSortedData(_res);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.log("error", err);
      });
    }
  }, [elapsedTime, flag, washer?._id, volumeData]);

  const handleTableChange = (
    pagination: TablePaginationConfig,
  ) => {
    setPage(pagination.current ? pagination.current : 1);
  }
  
  const config = {
    data: volumeData,
    xField: 'date',
    yField: 'volume',
    xAxis: {tickCount: 5},
    animation: undefined,
    slider: {
      start: 0,
      end: 1,
      trendCfg: {
        isArea: true
      }
    },
    tooltip: {
      formatter: useCallback((datum: any) => {
        return { name: 'Volume (24H)', value: '$' + datum.volume?.toFixed(4) }
      }, [])
    },
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{data.length - ((page-1) * 10 + index)}</>)
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Target Volume',
      dataIndex: 'targetVolume',
      key: 'targetVolume',
      render: (dt: number) => (
        <>$ {formattedNumber(dt, 2)}</>
      )
    },
    {
      title: 'Volume (24H)',
      dataIndex: 'coinmarketVolume',
      key: 'coinmarketVolume',
      render: (dt: number) => (
        <>$ {formattedNumber(dt, 2)}</>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (bot: IWasherTransaction) => (
        <>{bot.coinmarketVolume ? formattedNumber((bot.coinmarketVolume * 100/bot.targetVolume), 2) : 0} %</>
      )
    },
    {
      title: 'Trading Volume',
      dataIndex: 'volume',
      key: 'tradingVolume',
      render: (dt: number) => (
        <>$ {formattedNumber(dt, 2)}</>
      )
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (dt: number) => (
        <>$ {formattedNumber(dt, 2)}</>
      )
    },
    {
      title: 'Loss',
      dataIndex: 'loss',
      key: 'loss',
      render: (dt: number) => (
        <>$ {formattedNumber(dt, 2)}</>
      )
    },
  ];
  
  return (
    <>
    {!isLoading && <div className="px-2">
      <Row>
      {data.length > 0 ? 
        <Col span={volumeData.length ? 14 : 24}>
          <Table 
            columns={columns}
            dataSource={data}
            rowKey="date"
            onChange={handleTableChange}
            pagination={{ position: ["bottomLeft"] }}
            scroll={{ x: 900 }}
          />
        </Col> : <></>}

        {volumeData.length ? <Col span={data.length ? 10 : 24} className="">
          <div className="ml-2 border-solid border-gray-dark border p-3">
            <Area {...config} height={180}/>
          </div>
        </Col> : <></>}

        {!volumeData.length && !data.length && <div className="w-full text-center">No Data</div>}
      </Row>
    </div>}
    {isLoading && <Spin />}
    </>
  )
}
