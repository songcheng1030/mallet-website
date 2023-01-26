import { createSelector } from "reselect";

import { AppState } from '..';
import { SocketState } from "./socket.reducer";
import { IChainMaxGasPrice } from "../../types";

export const selectChainMaxGasPrice = createSelector<AppState, SocketState, IChainMaxGasPrice>(
    (state) => state.socketModule,
    (socketModule) => socketModule.chainMaxGasPrice
)
