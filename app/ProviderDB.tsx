"use client";
import React, { useEffect, useState } from "react";

import { db, HCProvider } from "../database.config";
import { useLiveQuery } from "dexie-react-hooks";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { IndexableType } from "dexie";
import { HC_PROVIDER_INITIAL_DETAILS } from "./context/EHRContext";

function ProviderDB() {
    const [hCProvider, setHCProvider] = useState<HCProvider>();
    //assume that we don't have an account/address stored until we can retrieve one.
    const setupDB = (async () => {
        try {
            //have we got one from before?
            const existingProvider =
                await db.hcProvider.where('id').equals(1).first();
            console.log("existing provider is: " + existingProvider);
            //if we don't have one, add the default placeholder provider.
            if (typeof existingProvider === 'undefined') {
                console.log("existing provider undefined");
                //add a new one
                const newId = await db.hcProvider.add(HC_PROVIDER_INITIAL_DETAILS);
                console.log(`default initial account added to DB, id is ${newId},
                    address is ${HC_PROVIDER_INITIAL_DETAILS.account.address}.`);
                setHCProvider(HC_PROVIDER_INITIAL_DETAILS);
            } else {
                console.log(`returning existing provider entry from DB,
                    id is ${existingProvider.id},
                    address is ${existingProvider.account.address}.`);
                setHCProvider(existingProvider);
            }
        } catch (err) {
            console.log(`Didn't retrieve or add a provider, error is ${err}.`);
            return 0;
        }
    });

    useEffect(() => {
        setupDB();
    },[]);

    return (
        <div className="p-5 text-teal-700 decoration-slate-600">Provider DB Info:
            {(typeof hCProvider == 'undefined') &&
                <div>No provider record</div>
            }
            {hCProvider?.account.address == '0' &&
                <div>Provider placeholder stored</div>
            }
            {(typeof hCProvider !== 'undefined' &&
                hCProvider.account.address.length > 1) &&
                <div>Using stored address {hCProvider?.account.address}</div>
            }
        </div>

    )
}
export default ProviderDB;
