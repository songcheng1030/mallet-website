import { useState, useEffect } from "react";
import moment from 'moment';
import { useSelector } from 'react-redux';

import { selectElapsedTime } from "../../store/auth/auth.selectors";

interface Props {
  isBuy: boolean,
  criteriaTime: Date
}

const TimeCounter = (props: Props) => {
  const { isBuy, criteriaTime } = props;
  const elapsedTime = useSelector(selectElapsedTime);

  const [timeStr, setTimeStr] = useState<string>("00:00");
  const [isStart, setIsStart] = useState<boolean>(false);

  useEffect(() => {
    let str = '';
    const current = moment(new Date());
    const criteria = moment(criteriaTime);
    const diff = current.diff(criteria, 'seconds');

    if (diff > 0) setIsStart(true);
    else setIsStart(false);

    const minutes = Math.floor(Math.abs(diff) / 60);
    if (minutes < 10) {
      str = '0' + minutes;
    } else {
      str = minutes.toString();
    }

    str += ' : '

    const seconds = Math.abs(diff) % 60;
    if (seconds < 10) {
      str += '0' + seconds;
    } else {
      str += seconds.toString();
    }

    setTimeStr(str);
  }, [elapsedTime, criteriaTime])

  return (
    <>
      <span className="mr-1">
        {isBuy && !isStart ? 'Buying starts in :' : 
        !isBuy && !isStart ? 'Selling starts in :' : 'Elapsed :'}
      </span>
      {timeStr}
    </>
  )
}

export default TimeCounter;
