import { Row, Col } from 'antd';
import { CopyableLabel } from '../../components/common/CopyableLabel';

interface ItemProps {
  name: string;
  value: string | number | undefined;
  copy?: string;
  link?: string;
  preUnit?: string;
  sufUnit?: string;
};

export const ViewItem = (props: ItemProps) => {
  return (
    <Row gutter={2}>
      <Col span={8} className='text-gray'> {props.name} </Col>
      <Col span={16} className='flex'>
        {props.link ? (
          <a
          href={props.link}
          target="_blank"
          rel="noreferrer"
        >
          : {props.value}
        </a>
        ) : (
          <div>: {props.preUnit} {props.value} &nbsp; <span className='text-xs'>{props.sufUnit}</span></div>
        )}
        {props.copy && <CopyableLabel value={props.copy} label=""/>}
      </Col>
    </Row>
  )
}
