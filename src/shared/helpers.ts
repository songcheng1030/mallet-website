import BigNumber from "bignumber.js";
import { History } from "history";
import { message, notification } from "antd";
import { NotificationPlacement } from "antd/lib/notification";
import Web3 from "web3";
import moment from "moment";

const DEFAULT_NUM_DECIMALS = 18;
const DEFAULT_DESIRED_DECIMALS = 2;
const ADDRESS_SHOW_AMOUNT = 5;
const DEFAULT_SHOW_NUM_DECIMALS = 4;

export enum TimeZone {
  PST = 'America/Los_Angeles'
}

export function shortenAddress(address: string) {
  if (!address) return '';
  const length = address.length;
  return (
    address.substr(0, ADDRESS_SHOW_AMOUNT + 2) +
    "..." +
    address.substr(length - ADDRESS_SHOW_AMOUNT, length)
  );
}

export function getBasePathFromHistory(history: History) {
  const split = history.location.pathname.split("/");
  return "/" + split[1];
}

export function formatNumber(
  num: BigNumber,
  numDecimals = DEFAULT_DESIRED_DECIMALS
) {
  return num.toFormat(numDecimals);
}

// export const formatStringNumber = (value: string | undefined) =>
//   numberWithCommas(`${value}`);

export function numberWithCommas(n: number | string) {
  var parts = n.toString().split(".");
  return (
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (parts[1] ? "." + parts[1] : "")
  );
}

// export function removeCommas(num: string): string {
//   return num.replace(/,/g, "");
// }

export function getStepFromDecimals(decimals: BigNumber): string {
  return new BigNumber(1).dividedBy(new BigNumber(10).pow(decimals)).toFixed();
}

export function copyToClipBoard(text: string) {
  navigator.clipboard.writeText(text);
  message.success({ content: "copied to clipboard" });
}

export function showNotification(
  message: string,
  type: "success" | "error" | "info" = "success",
  placement: NotificationPlacement = "bottomRight"
) {
  return notification[type]({
    message,
    placement,
  });
}

export function shiftedBigNumber(
  num: string | number,
  shiftAmount = DEFAULT_NUM_DECIMALS,
  shiftDirection = "negative"
) {
  let number = new BigNumber(num);
  let shift = shiftDirection === "negative" ? -1 * shiftAmount : shiftAmount;
  return number.shiftedBy(shift);
}

export function smallToBig(
  number: BigNumber,
  numDecimals = DEFAULT_NUM_DECIMALS
): string {
  return number.shiftedBy(numDecimals).toFixed();
}

export function bigToSmall(
  num: string | number,
  numDecimals = DEFAULT_NUM_DECIMALS,
  formatDecimals = DEFAULT_DESIRED_DECIMALS
): string {
  let number = new BigNumber(num);
  return number.shiftedBy(-1 * numDecimals).toFixed(formatDecimals, 1);
}

export function formatDate(date:string | Date){
  let parsed  = typeof date === "string"?new Date(date):date;
  return `${parsed.getMonth()}-${parsed.getDate()}-${parsed.getFullYear()}`
}

export function waitFor(timeout: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), timeout);
  });
}

export function simplePromise(inner: any) {
  return new Promise((resolve, reject) =>
    inner((res: any) => {
      resolve(res);
    })
  );
}

export function isValidEthAddress(address: string) {
  if (address === "") return true;
  return Web3.utils.isAddress(address);
}

export function timeConverter(timestamp: number){
  var a = new Date(timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

export function formattedNumber(value?: number, decimal?: number) {
  if (!value || typeof value !== 'number' || value === 0) return 0;
  const dispDecimal = decimal != undefined ? decimal : DEFAULT_SHOW_NUM_DECIMALS;
  return numberWithCommas(value.toFixed(dispDecimal));
}

export function formattedNumberWithoutZeroDecimal(value?: number, decimal?: number) {
  let res = formattedNumber(value, decimal).toString();
  if (res.indexOf('.') > -1) {
    while (res[res.length - 1] === "0") {
      res = res.substring(0, res.length - 1);
    }
    if (res[res.length - 1] === ".") {
      res = res.substring(0, res.length - 1);
    }
  }
  return res;
}

export function numberWithUnit(value?: number, decimal?: number) {
  if (!value || typeof value !== 'number' || value === 0) return 0;
  const dispDecimal = decimal ? decimal : DEFAULT_SHOW_NUM_DECIMALS;
  let unit = "";
  if (value > 1000) {
    value = value / 1000;
    unit = "K";
    if (value > 1000) {
      value = value / 1000;
      unit = "M";
      if (value > 1000) {
        value = value / 1000;
        unit = "B";
      }
    }
  }
  value = Math.floor(value * (10 ** dispDecimal)) / (10 ** dispDecimal);
  return numberWithCommas(value.toFixed(dispDecimal)) + unit;
}

export function convertTimeZone(date: string | Date, tz: string, format: string) {
  const m = new Date(date).toLocaleString('en-US', { timeZone: tz });
  return moment(m).format(format);
}
