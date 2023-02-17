"use client";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';
import { DAPP_NAME_FOR_CONNECTION, useEHRW3Context } from "../context/EHRW3Context";

function ProviderW3() {

    const [extensions, setExtensions] =  useState<InjectedExtension[]>();
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();
    const [w3Api, setW3Api] = useState<ApiPromise>();
    const [allExtensionAccounts, setAllExtensionAccounts] =
        useState<InjectedAccountWithMeta[]>([]);
    //const { w3Setup, w3Api } = useEHRW3Context();
    //assume that we don't have an account/address stored until we can retrieve one.
    let isAccountStoredAlready = false;

    const w3ProviderSetup = async() => {
        const providerURL = process.env.NEXT_PUBLIC_WS_PROVIDER_URL;
        console.log("providerURL is" + providerURL);
        const wsProvider = new WsProvider(process.env.NEXT_PUBLIC_WS_PROVIDER_URL);
        const w3Api = await ApiPromise.create({ provider: wsProvider });
        setW3Api(w3Api); //specify generic <ApiPromise> in useState above to stop the error here.
        const extensions = await web3Enable(DAPP_NAME_FOR_CONNECTION);
        const browserW3Extensions = await web3Enable(DAPP_NAME_FOR_CONNECTION);
        if(browserW3Extensions && (browserW3Extensions.length > 0)) {
            const extensionAccounts:InjectedAccountWithMeta[] = await web3Accounts();
            setExtensions(browserW3Extensions);
            if (extensionAccounts && extensionAccounts.length > 0) {
                setAllExtensionAccounts(extensionAccounts);
            }
        }
    }

    //this runs *before* the w3Api is created, to create it
    useEffect(() => {
        console.log("Running w3ProviderSetup");
        w3ProviderSetup();
    }, []);

    //create another useEffect that only runs *after* the API is created.
    //This just tests the RPCs connectivity
    useEffect(() => {
        if(!w3Api) {
            console.log("w3Api not loaded");
            return;
        }
        (async() => {  //run straight after creation, to show it's connected
            console.log("got w3Api loaded");
            const time = await w3Api.query.timestamp.now();
            console.log(time.toPrimitive());
        })();
    }, [w3Api]);


    return (
        <div className="p-5 text-teal-700 decoration-slate-600">Provider Web3 Info:
            {(typeof w3Api == 'undefined') &&
                <div>No connection to chain</div>
            }
            {w3Api &&
                <div>Web3 API can connect OK</div>
            }
        </div>

    )

}
export default ProviderW3;