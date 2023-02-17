"use client";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import React, {ReactNode, useState} from "react";
import { db, HCProvider } from "../../database.config";
import { EHRContext, HC_PROVIDER_INITIAL_DETAILS } from "./EHRContext";

interface IProps {
    children: ReactNode;
}

const EHRContextProvider = ({children} : IProps) => {

    const [hcProvider, setHCProvider] = useState<HCProvider>(HC_PROVIDER_INITIAL_DETAILS);

    const refreshProviderFromDB = async() => {
        const refreshedProvider: HCProvider | undefined =  await db.hcProvider.get(1);
        if (typeof refreshedProvider != 'undefined') {
            setHCProvider(refreshedProvider);
        }
    };

    const updateProviderRegDetails = async (
        providerName:string,
        providerSpecialty:string,
        providerLocation: string) => {
            if (hcProvider) {
                console.log('updating provider reg details');
                hcProvider.name = providerName;
                hcProvider.specialty = providerSpecialty;
                hcProvider.location = providerLocation;
                await db.hcProvider.update(hcProvider.id, {
                    name: providerName,
                    specialty: providerSpecialty,
                    location: providerLocation
                }).then(function (updated) {
                    if (updated)
                        console.log (`Updated id ${hcProvider.id} with reg details`);
                    else
                        console.log (`No update to id ${hcProvider.id}`);
                });
            } else {
                console.log('no provider for which to update reg details');
            }
        };
    const updateProviderAccount = async (providerSelectedAccount:InjectedAccountWithMeta) => {
        if (hcProvider) {
            console.log('updating provider account details');
            hcProvider.account = providerSelectedAccount;
            await db.hcProvider.update(hcProvider.id, {
                account: providerSelectedAccount
            }).then(function (updated) {
                if (updated)
                    console.log (`Updated id ${hcProvider.id} with account details`);
                else
                    console.log (`No update to id ${hcProvider.id}`);
            });
        } else {
            console.log('no provider for which to update account details');
        }
    };
    const updateProviderKeyDetails = async (
        publicKey: Uint8Array,
        secretKey: Uint8Array) => {
        if (hcProvider) {
            console.log('updating provider keys details');
            hcProvider.publicKey = publicKey;
            hcProvider.secretKey = secretKey;
            await db.hcProvider.update(hcProvider.id, {
                publicKey: publicKey,
                secretKey: secretKey
            }).then(function (updated) {
                if (updated)
                    console.log (`Updated id ${hcProvider.id} with keys details`);
                else
                    console.log (`No update to id ${hcProvider.id}`);
            });
        } else {
            console.log('no provider for which to update key details');
        }
    };

    const getLocallyStoredAccount = async () => {
        if (hcProvider) {
            console.log('getting locally stored account');
            return hcProvider.account;
        } else {
            throw new Error("hcProvider unavailable to get locally stored account.");
        }
    }

    return <EHRContext.Provider value={{
        hcProvider, updateProviderRegDetails, updateProviderAccount,
        updateProviderKeyDetails, getLocallyStoredAccount, refreshProviderFromDB
    }}>{children}</EHRContext.Provider>;
}

export default EHRContextProvider;
