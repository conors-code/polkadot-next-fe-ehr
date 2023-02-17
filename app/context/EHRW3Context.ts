import { HCProvider } from "../../database.config";
import { createContext, useContext } from "react";
import { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { Keypair } from "@polkadot/util-crypto/types";

export interface AccountWithMetaAndKeyPair {
    createdAccount: InjectedAccountWithMeta;
    keyPair: Keypair;
}

interface EHRW3ContextIfc {
    w3Api:ApiPromise | undefined;
    allExtensionAccounts: InjectedAccountWithMeta[] | undefined;
    getSelectedAccount:() => void;
    createAccountFromScratch:() =>  void;
    w3Setup:() =>  void;
    createdAccountWithKeys: AccountWithMetaAndKeyPair | undefined;
}
export const DAPP_NAME_FOR_CONNECTION = "EHR DApp";

export const EHRW3Context = createContext<EHRW3ContextIfc>({
    w3Api:undefined,
    allExtensionAccounts: undefined,
    getSelectedAccount() {},
    async createAccountFromScratch() {},
    async w3Setup() {},
    createdAccountWithKeys: undefined
});

export const useEHRW3Context = () => useContext(EHRW3Context);