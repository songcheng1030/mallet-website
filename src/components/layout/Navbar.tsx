import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import moment from 'moment-timezone';
import { Menu, Dropdown } from 'antd';
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';

import UserImg from '../../images/user.png';
import LogoImg from '../../images/Mallet-Logo-WHITE.png';
import { logout, increaseTime } from '../../store/auth/auth.actions';
import { selectUser } from "../../store/auth/auth.selectors";

export function Navbar() {
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState<string>("");
  const user = useSelector(selectUser);

  useEffect(() => {
    const timerId = setInterval(async () => {
      setCurrentTime(moment().format('HH:mm:ss MM-DD-YYYY').toString());
      increaseTime(dispatch);
    }, 1000);
    return () => clearInterval(timerId);
  }, [dispatch]);

  const signOut = () => {
    logout(dispatch);
  }

  const menu = (
    <Menu className="px-2">
      <Menu.Item icon={<SettingOutlined />} key="setting">
        <Link to='/setting'>Setting</Link>
      </Menu.Item>
      <Menu.Item 
        icon={<LogoutOutlined />} 
        key="logout"
        onClick={signOut}
      >
        Log out
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="h-full flex items-center px-4 top-navbar">
      <div className="flex flex-row items-center px-4" style={{width: '18em'}}>
        <Link to='/' >
          <img src={LogoImg} alt='logo' width='85%' />
        </Link>
      </div>
      <div className="px-6 flex-1 flex justify-end items-center">
        <div className="text-lg mr-5" style={{color: '#eee'}}>
          {currentTime}
        </div>
        <Dropdown overlay={menu}>
          <div
            className="ant-dropdown-link cursor-pointer flex items-center text-md text-gray-light" 
            onClick={e => e.preventDefault()}
          >
            <div className="mr-2">
              <img src={UserImg} width={28} alt="avatar" />
            </div>
            <span className='text-lg'> {user.username} </span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
