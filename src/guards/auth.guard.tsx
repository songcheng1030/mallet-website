import { FC } from "react";
import { useSelector } from 'react-redux';
import { selectLoggedIn } from "../store/auth/auth.selectors";

interface Props {
  authorized: boolean;
}

const AuthGuard: FC<Props> = ({authorized, children}) => {
  const loggedIn = useSelector(selectLoggedIn);

  if (authorized !== loggedIn) {
    return null
  }

  return <>{children}</>;
}

export default AuthGuard;
