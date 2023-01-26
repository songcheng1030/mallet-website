import { ETradingThread, ERunningStatus } from '.';

export const tradingTxt: {[name:string]: string} = {
  [ETradingThread.NONE]: "-",
  [ETradingThread.APPROVING_BUY]: "Approving Buy",
  [ETradingThread.APPROVING_SELL]: "Approving Sell",
  [ETradingThread.BUYING_INSTANT]: "Buying Instance",
  [ETradingThread.BUYING_SPAM]: "Buying Spam",
  [ETradingThread.BUYING_EVENT]: "Buying Event",
  [ETradingThread.SELLING_INSTANT]: "Selling Instance",
  [ETradingThread.SELLING_SPAM]: "Selling Spam",
  [ETradingThread.SELLING_TIMER]: "Selling Timeer",

  [ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET]: "Sending Coin",
  [ETradingThread.AUTO_SENDING_BASETOKEN_TO_NEW_WALLET]: "Sending Base Token",
  [ETradingThread.AUTO_APPROVE_PRE_BUYING]: "Approving Pre Buy",
  [ETradingThread.AUTO_PRE_BUYING]: "Pre Buy",
  [ETradingThread.AUTO_APPROVE_PRE_SELLING]: "Approving Pre Sell",
  [ETradingThread.AUTO_PRE_SELLING]: "Pre Sell",
  [ETradingThread.AUTO_APPROVE_BUYING]: "Approving Buy",
  [ETradingThread.AUTO_BUYING]: "Buying",
  [ETradingThread.AUTO_APPROVE_SELLING]: "Approving Sell",
  [ETradingThread.AUTO_SELLING]: "Selling",
  [ETradingThread.AUTO_FINISHED]: "Succeed",
};

export const runningColorTxt : {[name:string]: string} = {
  [ERunningStatus.DRAFT]: 'bg-pink',
  [ERunningStatus.RUNNING]: 'bg-yellow',
  [ERunningStatus.SUCCEEDED]: 'bg-green',
  [ERunningStatus.FAILED]: 'bg-red',
  [ERunningStatus.ARCHIVED]: 'bg-gray',
  [ERunningStatus.NONE]: 'bg-gray',
  [ERunningStatus.WAITING]: 'bg-gray',
}
