import { Pie, Cell, ResponsiveContainer, PieChart, PieLabelRenderProps } from 'recharts';

const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: PieLabelRenderProps) => {
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > Number(cx) ? 'start' : 'end'} dominantBaseline="central">
      {name} 
      {/* {`${(Number(percent) * 100).toFixed(0)}%`} */}
    </text>
  );
};

interface Props {
  data: any
}

export const CustomPieChart = (props: Props) => {
  const { data } = props;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart >
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry: any, index: any) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
