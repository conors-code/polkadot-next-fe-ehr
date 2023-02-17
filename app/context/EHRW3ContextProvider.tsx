"use client";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types";
import { cryptoWaitReady, mnemonicGenerate, mnemonicToMiniSecret,
    mnemonicValidate, sr25519PairFromSeed } from "@polkadot/util-crypto";
import React, {ReactNode, useState} from "react";
import { db, HCProvider } from "../../database.config";
import { DAPP_NAME_FOR_CONNECTION, EHRW3Context, AccountWithMetaAndKeyPair } 
    from "./EHRW3Context";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { Keypair } from "@polkadot/util-crypto/types";

interface IProps {
    children: ReactNode;
}

const EHRW3ContextProvider = ({children} : IProps) => {
    const [w3Api, setW3Api] =  useState<ApiPromise>();
    const [extensions, setExtensions] =  useState<InjectedExtension[]>();
    const [allExtensionAccounts, setAllExtensionAccounts] =
        useState<InjectedAccountWithMeta[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();
    const [createdAccountWithKeys, setCreatedAccountWithKeys] =
        useState<AccountWithMetaAndKeyPair>();

    async function w3Setup() {
        const providerURL = process.env.NEXT_PUBLIC_WS_PROVIDER_URL;
        console.log("CP providerURL is" + providerURL);
        const wsProvider = new WsProvider(process.env.NEXT_PUBLIC_WS_PROVIDER_URL);
        const w3Api = await ApiPromise.create({ provider: wsProvider });
        setW3Api(w3Api); //specify generic <ApiPromise> in useState above to stop the error here.
        const browserW3Extensions = await web3Enable(DAPP_NAME_FOR_CONNECTION);
        if(browserW3Extensions && (browserW3Extensions.length > 0)) {
            const extensionAccounts:InjectedAccountWithMeta[] = await web3Accounts();
            setExtensions(browserW3Extensions);
            if (extensionAccounts && extensionAccounts.length > 0) {
                setAllExtensionAccounts(extensionAccounts);
            }
        }
    }
    async function createAccountFromScratch() {
        await cryptoWaitReady();
        const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 }); //42 is default
        const myNewAcMnemonic = mnemonicGenerate();
        console.log(`my new mnemonic is ${myNewAcMnemonic}`);

        const isValidMnemonic = mnemonicValidate(myNewAcMnemonic);
        console.log(`isValidMnemonic: ${isValidMnemonic}`);

         // Create valid Substrate-compatible seed from mnemonic
        const myNewAcSeed = mnemonicToMiniSecret(myNewAcMnemonic);

        // Generate new public/secret keypair for Alice from the supplied seed

        const keyPair = sr25519PairFromSeed(myNewAcSeed);
        //const publicKey = keyringPair.publicKey;
        //const secretKey  = keyringPair.secretKey;
        const keyringPair = keyring.addFromSeed(myNewAcSeed);
        const address = keyringPair.address;
        console.log(`address is ${address}`);
        keyring.setSS58Format(0);
        const addrFormat0 = keyring.encodeAddress(keyPair.publicKey, 0);
        console.log(`addrF2 is ${addrFormat0}`);

        //generate an address from the keyPair
        //fit this into InjectedAccountWithMeta and return it as an array from here
        const theNewAccount:InjectedAccountWithMeta = {
            address: address,
            meta: {
                name: 'EHR generated account',
                source: 'EHR front end'
            },
            type: 'sr25519'
        };
        const createdAccountWithKeys = { theNewAccount, keyPair};
        useState(createdAccountWithKeys);
        //return { theNewAccount, keyPair}; //can't return through interface?
    }

    function getW3ExtensionAccounts() {
        return allExtensionAccounts;
    }
    function getSelectedAccount() {
        return selectedAccount;
    }

    return <EHRW3Context.Provider value={{
                w3Api, allExtensionAccounts, 
                getSelectedAccount() {selectedAccount},
                async createAccountFromScratch() {}, async w3Setup() {},
                createdAccountWithKeys
            }}>{children}
            </EHRW3Context.Provider>;
}

export default EHRW3ContextProvider;