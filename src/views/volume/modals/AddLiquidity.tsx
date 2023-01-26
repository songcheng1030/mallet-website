import { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, TimePicker, InputNumber, Row, Col, Slider } from 'antd';
import moment from "moment";
import BigNumber from 'bignumber.js';

import { IAddLiquiditySchedule, EVolumeBotStatus } from '../../../types';
import { formattedNumber } from '../../../shared';

interface Props {
  visible: boolean,
  selectedLiquidity: (IAddLiquiditySchedule & {index: number}) | null,
  tokenBalance: number,
  tokenPrice: number,
  setVisible: (visible: boolean) => void
  addLiquiditySchedule: (schedule: IAddLiquiditySchedule) => void
  onUpdateLiquidity: (schedule: IAddLiquiditySchedule & {index: number}) => void
};

export const AddLiquidity = (props: Props) => {
  const { visible, selectedLiquidity, tokenBalance, tokenPrice, setVisible, addLiquiditySchedule, onUpdateLiquidity } = props;
  const [form] = Form.useForm();

  const [slider, setSlider] = useState<number>(0);

  useEffect(() => {
    if (selectedLiquidity && selectedLiquidity.tokenAmount) {
      setSlider(Number((selectedLiquidity.tokenAmount * 100 / Number(tokenBalance)).toFixed(2)));
    
      const formData = {
        tokenAmount: selectedLiquidity.tokenAmount,
        baseCoin: formattedNumber(new BigNumber(tokenPrice).multipliedBy(selectedLiquidity.tokenAmount).toNumber()),
        time: {
          liquidityTime: moment(selectedLiquidity.time),
        },
      }
      form.setFieldsValue(formData);
    }
  }, [form, selectedLiquidity, tokenBalance, tokenPrice]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedLiquidity) {
      onUpdateLiquidity({
        ...selectedLiquidity,
        time: values.time.liquidityTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        tokenAmount: values.tokenAmount
      });
    } else {
      const temp = {
        tokenAmount: values.tokenAmount,
        time: values.time.liquidityTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        status: EVolumeBotStatus.NONE
      }
      addLiquiditySchedule(temp);
    }
    form.resetFields();
    setVisible(false);
  };

  const onChangeAmount = (value: number) => {
    form.setFieldsValue({
      baseCoin: formattedNumber(new BigNumber(tokenPrice).multipliedBy(value).toNumber())
    });
    setSlider(Number((value * 100 / Number(tokenBalance)).toFixed(2)));
  }

  const onChangePercent = (value: number) => {
    const ta = Number((Number(tokenBalance) * value / 100).toFixed(2));
    setSlider(Number(value.toFixed(2)));
    form.setFieldsValue({
      tokenAmount: ta,
      baseCoin: formattedNumber(new BigNumber(tokenPrice).multipliedBy(ta).toNumber())
    });
  }

  return (
    <Modal
      title="Add Liquidity"
      visible={visible}
      centered
      onOk={form.submit}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Date">
          <Input.Group compact>
            <Form.Item
              name={["time", "liquidityTime"]}
              rules={[{ required: true, message: 'Please select day!' }]}
              noStyle
            >
              <DatePicker style={{ width: '50%' }} />
            </Form.Item>
            <Form.Item
              name={["time", "liquidityTime"]}
              rules={[{ required: true, message: 'Please select time!' }]}
              noStyle
            >
              <TimePicker style={{ width: '50%' }} />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item
          label="Token Amount"
          name="tokenAmount"
          rules={[{ required: true, message: 'Please enter amount of token!' }]}
        >
          <InputNumber max={Number(tokenBalance)} onChange={onChangeAmount} className="w-full" />
        </Form.Item>
        <Row className="mb-5">
          <Col span={19}>
            <Slider
              min={0}
              max={100}
              onChange={onChangePercent}
              value={typeof slider === 'number' ? slider : 0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              className="w-full"
              value={slider}
              onChange={onChangePercent}
            />
          </Col>
          <Col className="flex items-center justify-end" span={1}>
            %
          </Col>
        </Row>

        <Form.Item
          label="Estimated Coin Amount"
          name="baseCoin"
        >
          <Input className="w-full" readOnly />
        </Form.Item>
      </Form>
    </Modal>
  )
}
