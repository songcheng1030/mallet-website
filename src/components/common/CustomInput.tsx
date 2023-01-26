import { useState } from 'react';
import { Input, InputNumber } from 'antd';

interface Props {
	type: 'text' | 'number';
	value: string | number;
	onChange: () => void,
	onEnterPress: () => void,
}
export const CustomInput = ({type, onChange, onEnterPress}: Props) => {
	// const [val, setVal] = useState<number | string>('');
	return (
		<>
			{type === 'text' && <Input />}
			{type === 'number' && <InputNumber />}
		</>
	)
}
