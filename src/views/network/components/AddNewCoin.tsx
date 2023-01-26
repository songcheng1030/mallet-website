import { useState } from 'react';
import { Modal, Button, Form, Input, Select, Row, Col } from 'antd';
import { ICoin, ITokenDetailReqDto, IToken } from '../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { addCoin } from '../../../store/network/network.action';
import { selectBlockchains } from '../../../store/network/network.selectors';
import { tokenService } from '../../../services';
import { showNotification } from '../../../shared';

export const AddNewCoin = () => {
  const dispatch = useDispatch();
  const blockchainData = useSelector(selectBlockchains);
  const [coinInfo, setCoinInfo] = useState<IToken | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  const handleAddCoin = (coin: ICoin) => {
    const payload: ITokenDetailReqDto = {
      blockchainId: form.getFieldValue("blockchain"),
      tokenAddress: form.getFieldValue("address")
    };
    tokenService.getTokenDetail(payload)
    .then(res => {
      if (res?.token) {
        coin.name = res.token.name;
        coin.decimals = res.token.decimals;
        coin.symbol = res.token.symbol
        coin.totalSupply = res.token.totalSupply
        setCoinInfo(res.token);
        setConfirmLoading(true);
        dispatch(addCoin(coin));
        setConfirmLoading(false);
        form.resetFields();
        setCoinInfo(null);
        setVisible(false);
      } else {
        showNotification("Could not read valid information", "error", "topRight")
      }
    })
    .catch(err => {
      showNotification("Could not read valid information", "error", "topRight");
    })

  }

  const handleCoinInfo = () => {
    const payload: ITokenDetailReqDto = {
      blockchainId: form.getFieldValue("blockchain"),
      tokenAddress: form.getFieldValue("address")
    };
    tokenService.getTokenDetail(payload)
    .then(res => {
      if (res?.token) {
        setCoinInfo(res.token);
      } else {
        showNotification("Could not read valid information", "error", "topRight")
      }
    })
    .catch(err => {
      showNotification("Could not read valid information", "error", "topRight");
    })
  }
  return (
    <>
      <Button type="primary" onClick={showModal} className="mb-3">
        Add New
      </Button>
      <Modal
        title="Add New Coin"
        visible={visible}
        onOk={form.submit}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCoin}
          autoComplete="off"
        >
          <Form.Item
            label="Chain"
            name="blockchain"
            rules={[{ required: true, message: 'Please select chain!' }]}
          >
            <Select placeholder='Select Chain'>
              {blockchainData.map((blockchain, idx) => (
                <Option key={idx} value={blockchain._id ? blockchain._id : 'unknown'}>{blockchain.name}  <span style={{ color: "#e8962e" }}>[{blockchain.coinSymbol}]</span>  ({blockchain.chainId})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Coin address"
            name="address"
            rules={[{ required: true, message: 'Please enter coin address!' }]}
          >
            <div className='flex justify-between'>
              <Input />
              <Button className='w-15' onClick={handleCoinInfo} >READ</Button>
            </div>
          </Form.Item>
          <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
            <Row gutter={24}>
              <Col span={8}>Name</Col>
              <Col className="text-blue-light">{coinInfo?.name}</Col>
            </Row>
          </div>
          <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
            <Row gutter={24}>
              <Col span={8}>Symbol</Col>
              <Col className="text-blue-light">{coinInfo?.symbol}</Col>
            </Row>
          </div>
          <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
            <Row gutter={24}>
              <Col span={8}>Decimals</Col>
              <Col className="text-blue-light">{coinInfo?.decimals}</Col>
            </Row>
          </div>
          <div className="border-solid border border-l-0 border-r-0 border-t-0 border-gray-dark p-1.5">
            <Row gutter={24}>
              <Col span={8}>Total Supply</Col>
              <Col className="text-blue-light">{coinInfo?.totalSupply}</Col>
            </Row>
          </div>
        </Form>
      </Modal>
    </>
  )
}