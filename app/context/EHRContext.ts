import { HCProvider } from "../../database.config";
import { createContext, useContext } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

export const DEFAULT_INVALID_ADDR = '0';

export const INITIAL_NO_ADDR_ACCOUNT: InjectedAccountWithMeta =
{
    address: DEFAULT_INVALID_ADDR,
    meta: {
        name: 'EHR generated account',
        source: 'EHR front end'
    },
    type: 'sr25519'
};

export const HC_PROVIDER_INITIAL_DETAILS : HCProvider = {
    id: 1,
    account: INITIAL_NO_ADDR_ACCOUNT,
    name: '',
    specialty: '',
    location: '',
    publicKey: new Uint8Array(),
    secretKey: new Uint8Array()
};

interface EHRContextIfc {
    hcProvider:HCProvider,
    updateProviderRegDetails:(
        providerName:string,
        providerSpecialty:string,
        providerLocation: string
    ) => void;
    updateProviderAccount:(
        providerSelectedAccount:InjectedAccountWithMeta
    ) => void;
    updateProviderKeyDetails:(
        publicKey: Uint8Array,
        secretKey: Uint8Array,
    ) => void;
    getLocallyStoredAccount:() => void;
    refreshProviderFromDB:() => void;

}

export const EHRContext = createContext<EHRContextIfc>({
    hcProvider: HC_PROVIDER_INITIAL_DETAILS,
    refreshProviderFromDB() {},
    updateProviderRegDetails(providerName,providerSpecialty,providerLocation) {},
    updateProviderAccount(providerSelectedAccount) {},
    updateProviderKeyDetails(publicKey, secretKey) {},
    getLocallyStoredAccount() {}
});

export const useEHRContext = () => useContext(EHRContext);