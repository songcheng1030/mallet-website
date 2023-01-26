import { useSelector } from 'react-redux';
import { EUserRole } from '../types';
import { selectUser } from "../store/auth/auth.selectors";

interface Props {
  roles: EUserRole[],
  not?: boolean;
}

const RoleGuard = (props: Props) => {
  const user = useSelector(selectUser);

  if ((!props.not && props.roles.includes(user.role)) || (props.not && !props.roles.includes(user.role))) {
    return true;
  }

  return false;
}

export default RoleGuard;
