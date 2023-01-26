import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Tabs, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Web3 from 'web3';

import { getUsers } from '../../store/user/user.actions';
import { getAllBlockchain } from '../../store/network/network.action';
import { EditDexWallet } from './components/EditDexWallet';
import { EditCexAccount } from './components/EditCexAccount';
import { DexWallet } from './DexWallet';
import { CexAccount } from './CexAccount';
import { CompanyWallet } from './CompanyWallet';
import { addCompanyWallet } from '../../store/companyWallet/companyWallet.actions';
import { RoleGuard } from '../../guards';
import { EUserRole } from '../../types';

const { TabPane } = Tabs;

export const WalletPage = () => {
  const dispatch = useDispatch();

  const [visible, setVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('dex');

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getAllBlockchain());
  }, [dispatch]);

  const handleAddCompanmyWallet = async () => {
    const web3Client = new Web3('https://polygon-rpc.com');
    const newAccount = web3Client.eth.accounts.create(new Date().toString());

    const wallet = {
      privateKey: newAccount.privateKey,
      publicKey: newAccount.address,
      cntInUse: 0
    };
    dispatch(addCompanyWallet(wallet));
  }

  const handleNew = () => {
    if (selectedTab === 'company') {
      Modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleOutlined />,
        content: 'Are you sure you want to add a new company wallet?',
        okText: 'Ok',
        cancelText: 'Cancel',
        onOk() {
          handleAddCompanmyWallet();
        },
      });
    } else {
      setVisible(true);
    }
  }
  
  return (
    <div className="bg-gray-dark rounded-md p-3 relative">
      <div className="h-12 flex justify-center items-center absolute right-6">
        <Button type="primary" onClick={handleNew} className="z-50">
          Add New
        </Button>
      </div>
      <div className="p-3 pb-3">
        <Tabs onChange={(tab)=>setSelectedTab(tab)} activeKey={selectedTab} >
          <TabPane tab="DEX Wallets" key="dex">
           <DexWallet />
          </TabPane>
          {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
            <TabPane tab="CEX Wallets" key="cex">
              <CexAccount />
            </TabPane>
          }
          {RoleGuard({ roles: [EUserRole.ADMIN] }) &&
            <TabPane tab="Company Wallets" key="company">
              <CompanyWallet />
            </TabPane>
          }
        </Tabs>
      </div>

      {selectedTab === 'dex' && visible && (
        <EditDexWallet 
          visible={visible}
          setVisible={setVisible}
        />
      )}

      {selectedTab === 'cex' && visible && (
        <EditCexAccount 
          visible={visible}
          setVisible={setVisible}
        />
      )}
    </div>
  )
}