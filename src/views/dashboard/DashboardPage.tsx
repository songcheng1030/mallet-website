import { Table } from 'antd';

import { CustomPieChart } from './components';
import { data } from './components';

export const DashboardPage = () => {

  const columns = [
    {
      title: 'No',
      key: 'index',
      render: (text: any, record: any, index: number) => (<>{index + 1}</>)
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Bought',
      dataIndex: 'bought',
      key: 'bought',
    },
    {
      title: 'Bought Fee',
      dataIndex: 'boughtFee',
      key: 'boughtFee',
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Sold Fee',
      dataIndex: 'soldFee',
      key: 'soldFee',
    },
    {
      title: 'Earned',
      dataIndex: 'earned',
      key: 'earned',
    },
  ];

  return (
    <div className="bg-gray-dark rounded-md p-3">
      <div className="p-3">
        <div className='flex justify-around bg-gray-darkest mb-3'>
          <div className='w-96 h-96'>
            <CustomPieChart />
          </div>
          {/* <div className='w-96 h-96'>
            <CustomPieChart />
          </div> */}
        </div>
        
        <div className='w-full'>
          <Table columns={columns} dataSource={data} rowKey="_id" />
        </div>
      </div>
    </div>
  )
}
