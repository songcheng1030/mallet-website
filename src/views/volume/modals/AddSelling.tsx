import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, TimePicker, Row, Col, Slider } from 'antd';
import moment from 'moment';

import { ISellingSchedule, EVolumeBotStatus } from "../../../types";

interface Props {
  visible: boolean,
  selectedSelling: (ISellingSchedule & {index: number}) | null,
  tokenBalance: number,
  setVisible: (visible: boolean) => void,
  addSellingSchedule: (schedule: ISellingSchedule) => void,
  onUpdateSelling: (schedule: ISellingSchedule & {index: number}) => void
};

export const AddSelling = (props: Props) => {
  const { visible, selectedSelling, tokenBalance, setVisible, addSellingSchedule, onUpdateSelling } = props;
  const [form] = Form.useForm();

  const [slider, setSlider] = useState<number>(0);

  useEffect(() => {
    if (selectedSelling && selectedSelling.tokenAmount) {
      setSlider(Number((selectedSelling.tokenAmount * 100 / Number(tokenBalance)).toFixed(2)));
      const formData = {
        tokenAmount: selectedSelling?.tokenAmount,
        time: {
          sellingTime: moment(selectedSelling?.time),
        },
      }
      form.setFieldsValue(formData);
    }
  }, [form, selectedSelling, tokenBalance]);

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onFinish = (values: any) => {
    if (selectedSelling) {
      onUpdateSelling({
        ...selectedSelling,
        time: values.time.sellingTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        tokenAmount: values.tokenAmount
      });
    } else {
      let temp = {
        ...values,
        time: values.time.sellingTime.format('YYYY-MM-DD HH:mm:ss').toString(),
        status: EVolumeBotStatus.NONE
      }
      addSellingSchedule(temp);
    }
    form.resetFields();
    setVisible(false);
  };

  const onChangeAmount = (value: number) => {
    const sliVal = Number((value * 100 / Number(tokenBalance)).toFixed(2));
    setSlider(sliVal);
  }

  const onChangePercent = (value: number) => {
    setSlider(Number(value.toFixed(2)));
    form.setFieldsValue({
      tokenAmount: Number((Number(tokenBalance) * value / 100).toFixed(2))
    });
  }

  return (
    <Modal
      title="Selling"
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
              name={["time", "sellingTime"]}
              rules={[{ required: true, message: 'Please select day!' }]}
              noStyle
            >
              <DatePicker style={{ width: '50%' }} />
            </Form.Item>
            <Form.Item
              name={["time", "sellingTime"]}
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
          <InputNumber className="w-full" max={Number(tokenBalance)} onChange={onChangeAmount} />
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
      </Form>
    </Modal>
  )
}
