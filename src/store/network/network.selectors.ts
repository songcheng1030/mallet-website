import { createSelector } from "reselect";

import { AppState } from '..';
import { NetworkState } from "./network.reducer";
import { IBlockchain, INode, IDex, ICoin } from "../../types";

export const selectBlockchains = createSelector<AppState, NetworkState, IBlockchain[]>(
    (state) => state.networkModule,
    (networkModule) => networkModule.blockchains
)

export const selectNodes = createSelector<AppState, NetworkState, INode[]>(
    (state) => state.networkModule,
    (networkModule) => networkModule.nodes
)

export const selectDexs = createSelector<AppState, NetworkState, IDex[]>(
    (state) => state.networkModule,
    (networkModule) => networkModule.dexs
)

export const selectCoins = createSelector<AppState, NetworkState, ICoin[]>(
    (state) => state.networkModule,
    (networkModule) => networkModule.coins
)