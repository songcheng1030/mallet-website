import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from 'redux-thunk';
import { combineReducers } from "redux";
import { loadingBarReducer } from 'react-redux-loading-bar'

import { authReducer } from "./auth/auth.reducer";
import { networkReducer } from "./network/network.reducer";
import { userReducer } from "./user/user.reducer";
import { walletReducer } from "./wallet/wallet.reducer";
import { botReducer } from "./bot/bot.reducer";
import { manualBotReducer } from "./manualBot/manualBot.reducer";
import { transactionReducer } from "./transaction/transaction.reducer";
import { poolReducer } from "./pool/pool.reducer";
import { socketReducer } from "./socket/socket.reducer";
import { volumeBotReducer } from "./volumeBot/volumeBot.reducer";
import { liquidatorBotReducer } from "./liquidatorBot/liquidatorBot.reducer";
import { washerBotReducer } from "./washerBot/washerBot.reducer";
import { cexAccountReducer } from "./cexAccount/cexAccount.reducer";
import { companyWalletReducer } from "./companyWallet/companyWallet.reducer";
import { TokenCreatorReducer } from "./tokenCreator/tokenCreator.reducer";

const rootReducer = combineReducers({
  loadingBar: loadingBarReducer,
  authModule: authReducer,
  userModule: userReducer,
  networkModule: networkReducer,
  walletModule: walletReducer,
  botModule: botReducer,
  manualBotModule: manualBotReducer,
  transactionModule: transactionReducer,
  poolModule: poolReducer,
  socketModule: socketReducer,
  volumeBotModule: volumeBotReducer,
  liquidatorBotModule: liquidatorBotReducer,
  washerBotModule: washerBotReducer,
  cexAccountModule: cexAccountReducer,
  companyWalletModule: companyWalletReducer,
  TokenCreatorModule: TokenCreatorReducer
});

export type AppState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
  )
);

export default store;
