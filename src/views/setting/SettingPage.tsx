import { useState, useEffect } from 'react';
import { Row, Col, Switch, Button } from 'antd';
import { useSelector } from 'react-redux';

import { selectUser } from "../../store/auth/auth.selectors";
import { OnTwoFactorAuth, OffTwoFactorAuth, ChangePwd } from './modals';
import { authService } from 'services';

export const SettingPage = () => {
  const [isOn2Fa, setIsOn2Fa] = useState<boolean>(false);
  const [isOff2Fa, setIsOff2Fa] = useState<boolean>(false);
  const [isChangePwd, setIsChangePwd] = useState<boolean>(false);
  const [totpRequired, setTotpRequired] = useState<boolean>(false);

  const user = useSelector(selectUser);

  useEffect(() => {
    authService.me().then(user => {
      user.totpRequired ? localStorage.setItem('totpRequest', '1') : localStorage.removeItem('totpRequest');
      setTotpRequired(user.totpRequired ? user.totpRequired : false);
    });
  }, []);

  const handle2Fa = (mfaCheck: boolean) => {
    mfaCheck ? setIsOn2Fa(true) : setIsOff2Fa(true);
  }

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3">
        <Row gutter={2} className='py-5 border-solid border-0 border-b border-gray-darkest'>
          <Col span={14}>
            <div className='text-base'>2FA:</div>
            <div className='text-md'>Enable Two Factor Authentication Service</div>
          </Col>
          <Col span={10} className='flex items-center'>
            <Switch checkedChildren="ON" unCheckedChildren="OFF" checked={totpRequired} onChange={handle2Fa} />
          </Col>
        </Row>

        <Row gutter={2} className='py-5 border-solid border-0 border-b border-gray-darkest'>
          <Col span={14}>
            <div className='text-base'>Email Service:</div>
            <div className='text-md'>Get Security Code in Your Mail</div>
          </Col>
          <Col span={10} className='flex items-center'>
            <div className='text-base'>{user.email}</div>
          </Col>
        </Row>

        <Row gutter={2} className='py-5'>
          <Col span={14}>
            <div className='text-base'>Change Password:</div>
            <div className='text-md'>Define A New Password</div>
          </Col>
          <Col span={10} className='flex items-center'>
            <Button 
              shape='round' 
              className='border-green'
              onClick={()=>setIsChangePwd(true)}
            >
              Change Password
            </Button>
          </Col>
        </Row>
      </div>

      {isOn2Fa && <OnTwoFactorAuth visible={isOn2Fa} setVisible={setIsOn2Fa} />}
      {isOff2Fa && <OffTwoFactorAuth visible={isOff2Fa} setVisible={setIsOff2Fa} />}
      {isChangePwd && <ChangePwd visible={isChangePwd} setVisible={setIsChangePwd} />}
    </div>
  )
}
