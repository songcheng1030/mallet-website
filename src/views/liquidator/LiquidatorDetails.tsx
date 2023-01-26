import { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { Row, Col, Table, Spin, Space } from "antd";
import moment from "moment";
import { Area, Pie } from '@ant-design/plots';

import { formattedNumber, shortenAddress, numberWithUnit } from "../../shared";
import { reportService } from "../../services";
import { ILiquidatorBot, ILiquidatorTransaction, ELiquidatorBotType } from "../../types";
import { selectElapsedTime } from "../../store/auth/auth.selectors";
import { LiquidatorOrderbook } from "./LiquidatorOrderbook";
import { CopyableLabel } from '../../components/common/CopyableLabel';

interface ItemPros {
  name: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
}
const ViewItem = (props: ItemPros) => {
  const {name, value, prefix, suffix} = props;
  return (
    <Row gutter={2} className="mb-1 border-solid border border-gray-dark border-t-0 border-l-0 border-r-0">
      <Col span={14} className="text-left"> 
        <span className="px-3">{name}</span>
      </Col>
      <Col span={10} className="text-right whitespace-nowrap px-3 "> 
        <div>
          {prefix && <span className="mr-1">{prefix} </span>}
          <span className="text-blue">{value}</span>
          {suffix && <span className="ml-1">{suffix}</span>}
        </div>
      </Col>
    </Row>
  )
}

interface Statistics {
  totalUSDSold: number;
  totalUSDFee: number;
  totalTokenSold: number;
  AmountOfSell: number;
  AverageSellSize: number;
}

interface Props {
  liquidator: ILiquidatorBot;
}

export const LiquidatorDetails = (props: Props) => {
  const { liquidator } = props;
  const [data, setData] = useState<ILiquidatorTransaction[]>([]);
  const [sortedData, setSortedData] = useState<any>([]);
  const [stat, setStat] = useState<Statistics>({
    totalUSDSold: 0,
    totalUSDFee: 0,
    totalTokenSold: 0,
    AmountOfSell: 0,
    AverageSellSize: 0,
  });
  const [flag, setFlag] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const elapsedTime = useSelector(selectElapsedTime);

  const config = {
    data: sortedData,
    xField: 'created',
    yField: 'soldPrice',
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
        return { name: 'Sold Price', value: '$' + datum.soldPrice.toFixed(4) }
      }, [])
    },
  }

  useEffect(() => {
    if (!flag) {
      setIsLoading(true);
    }
    
    if ((elapsedTime) % 4 === 0) {
      setFlag(true);
      reportService.getLiquidatorDetail(liquidator._id)
      .then(res => {
        setIsLoading(false);
        if (res && res.length > 0) {
  
          let temp = {
            totalUSDSold: 0,
            totalUSDFee: 0,
            totalTokenSold: 0,
            AmountOfSell: 0,
            AverageSellSize: 0,
          };
          for(let i=0; i<res.length; i++) {
            temp.totalUSDSold += res[i].price;
            temp.totalUSDFee += res[i].fee;
            temp.totalTokenSold += res[i].tokenAmount;
            res[i].soldPrice = res[i].tokenAmount === 0 ? 0 : (res[i].price + res[i].fee) / res[i].tokenAmount;
          }
          if (res.length === data.length) {
            return;
          }
          setData(res);
          
          let _res = res.slice().sort(function(a,b): any {
            if (new Date(a.created).getTime() < new Date(b.created).getTime()) {
              return -1;
            }
            if (new Date(a.created).getTime() > new Date(b.created).getTime()) {
              return 1;
            }
            return 0;
          })
          const newRes = _res.map(el => {
            return {
              ...el,
              created: moment(el.created).format('HH:mm:ss MM-DD-YYYY')
            }
          }) 
          setSortedData(newRes);
          temp.AmountOfSell = res.length;
          temp.AverageSellSize = temp.totalTokenSold / res.length;
          setStat(temp);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.log("error", err);
      });
    }
  }, [elapsedTime, flag, liquidator, data]);

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
      title: 'Date',
      dataIndex: 'created',
      key: 'created',
      sorter: (a: any, b: any) => (new Date(a.created).getTime() < new Date(b.created).getTime() ? -1 : 1),
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
      render: (date: string) => (
        <>{moment(date).format('DD/MM/YY HH:mm:ss')}</>
      )
    },
    {
      title: 'Token Sold',
      dataIndex: 'tokenAmount',
      key: 'tokenAmount',
      sorter: (a: any, b: any) => a.tokenAmount - b.tokenAmount,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
      render: (dt: number) => (
        <>{formattedNumber(dt)}</>
      )
    },
    {
      title: 'USD Sold',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: any, b: any) => a.price - b.price,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
      render: (dt: number) => (
        <>${formattedNumber(dt)}</>
      )
    },
    {
      title: 'USD Fee',
      dataIndex: 'fee',
      key: 'fee',
      sorter: (a: any, b: any) => a.fee - b.fee,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
      render: (dt: number) => (
        <>${formattedNumber(dt)}</>
      )
    },
    {
      title: 'Sold Price',
      key: 'soldPrice',
      sorter: (a: any, b: any) => a.soldPrice - b.soldPrice,
      sortDirections: ['ascend' as 'ascend', 'descend' as 'descend', 'ascend' as 'ascend'],
      showSorterTooltip: false,
      render: (transaction: ILiquidatorTransaction) => (
        <div>
          ${((transaction.fee + transaction.price) / transaction.tokenAmount).toFixed(4)}
        </div>
      )
    },
  ];
  
  const dexColumns = [
    ...columns,
    {
      title: 'Transaction Hash',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (txHash: string) => (
        <Space>
          <a
            href={`${liquidator.blockchain.explorer}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {shortenAddress(txHash)}
          </a>
          <CopyableLabel value={txHash} label="" />
        </Space>
      )
    }
  ]
  
  const pieConfig = {
    appendPadding: 0,
    data: [
      { type: 'Total USD Sold', value: Number(stat.totalUSDSold.toFixed(4)) },
      { type: 'Fee', value: Number(stat.totalUSDFee.toFixed(4)) },
    ],
    angleField: 'value',
    colorField: 'type',
    height: 200,
    radius: 0.7,
    legend: undefined,
    tooltip: {
      formatter: useCallback((datum: any) => {
        return { name: datum.type, value: '$' + datum.value }
      }, [])
    },
    label: {
      type: 'spider',
      labelHeight: 20,
      color: 'red',
      content: '{name}\n{percentage}'
    },
  }
  
  return (
    <>
    {!isLoading && <div className="px-2">
      {data.length > 0 ? <Row>
        <Col span={14}>
          <Table 
            columns={liquidator.type === ELiquidatorBotType.CEX ? columns : dexColumns}
            dataSource={data}
            rowKey="_id"
            pagination={{ position: ["bottomLeft"] }}
            scroll={{ x: 800 }}
          />
        </Col>
        <Col span={10} className="">
          <div className="ml-2 p-3 border-solid border-gray-dark border">
            <Row className="mb-3">
              <Col span={11}>
                <Pie 
                  { ...pieConfig }
                />
              </Col>
              <Col span={13} className="flex items-center justify-end">
                <div className="w-80">
                  <ViewItem name="Total USD Sold" value={formattedNumber(stat.totalUSDSold, 2)} prefix="$" />
                  <ViewItem name="Total USD Fee" value={formattedNumber(stat.totalUSDFee, 2)} prefix="$"/>
                  <ViewItem name="Total Token Sold" value={numberWithUnit(stat.totalTokenSold, 2)} suffix={liquidator.token.symbol}/>
                  <ViewItem name="Amount Of Sell" value={stat.AmountOfSell}/>
                  <ViewItem name="Average Sell Size" value={numberWithUnit(stat.AverageSellSize, 2)} suffix={liquidator.token.symbol}/>
                  <ViewItem name="Average Sell Price" value={formattedNumber((stat.totalUSDSold + stat.totalUSDFee) / stat.totalTokenSold)} prefix="$"/>
                </div>
              </Col>
            </Row>
            <Row >
              <Col span={24}>
                <Area {...config} height={180}/>
              </Col>
            </Row>
            <Row>
              <LiquidatorOrderbook liquidatorId={liquidator._id} />
            </Row>
          </div>
        </Col>
      </Row> : <>No Data</>}
    </div>}
    {isLoading && <Spin />}
    </>
  )
}
