import { useEffect, useState } from "react";
import { Row, Col, Pagination } from "antd";
import moment from "moment";
import { useSelector } from 'react-redux';

import { formattedNumber } from "../../shared";
import { botService } from "../../services";
import { ILiquidatorDailyOrderResponse } from 'types';
import { selectElapsedTime } from "../../store/auth/auth.selectors";

interface RowProps {
  date: string;
  buy: number;
  sell: number;
}

const TableRow = (props: RowProps) => {
  const {date, buy, sell} = props;
  return (
    <Row className="w-full border-solid border border-t-0 border-l-0 border-r-0 border-gray-dark">
      <Col span={8}>{moment(date).format('DD/MM/YY')}</Col>
      <Col span={8} className="text-blue">${formattedNumber(buy, 2)}</Col>
      <Col span={8} className="text-red">${formattedNumber(sell, 2)}</Col>
    </Row>
  )
}

const TableHeader = () => {
  return (
    <Row className="w-full font-medium border-solid border border-t-0 border-l-0 border-r-0 border-gray-dark">
      <Col span={8}>Date</Col>
      <Col span={8}>Buy</Col>
      <Col span={8}>Sell</Col>
    </Row>
  )
}

interface Props {
  liquidatorId: string;
}

export const LiquidatorOrderbook = (props: Props) => {
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [data, setData] = useState<ILiquidatorDailyOrderResponse[]>([]);

  const elapsedTime = useSelector(selectElapsedTime);

  useEffect(() => {
    if (elapsedTime % 10 !== 0) return;
    botService.getLiquidatorBotOrderboks({
      _id: props.liquidatorId,
      page,
      pageLength: 5
    })
    .then(res => {
      setData(res.data);
      setTotal(res.total);
    })
    .catch(err => {
      console.log(err)
    })
  }, [props.liquidatorId, page, elapsedTime]);

  return (
    <>
    {data.length > 0 && (
      <>
      <div className="w-full border border-solid border-gray-dark p-1">
        <div className="mb-1 font-semibold">Daily Order Amount</div>
        <TableHeader />
        {data.map((el, idx) => (
          <TableRow date={el._id} buy={el.buy/el.count} sell={el.sell/el.count} key={idx} />
        ))}
        {data.length > 5 && <div className='float-right mt-1'>
          <Pagination size="small" defaultCurrent={1} total={total} onChange={(page)=>setPage(page)} showSizeChanger={false} />
        </div>}
      </div>
      </>
    )}
    </>
  )
}
