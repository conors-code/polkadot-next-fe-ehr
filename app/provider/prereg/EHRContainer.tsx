"use client"

import { Keyring } from "@polkadot/api";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { cryptoWaitReady, mnemonicGenerate, mnemonicToMiniSecret, mnemonicValidate, sr25519PairFromSeed } from "@polkadot/util-crypto";
import React, { ChangeEvent, FormEvent, useEffect, useState} from "react";
import { DEFAULT_INVALID_ADDR, useEHRContext } from "../../context/EHRContext";
import { useEHRW3Context } from "../../context/EHRW3Context";


const EHRContainer = () => {

    const [providerName, setProviderName] = useState("");
    const [providerSpecialty, setProviderSpecialty] = useState("");
    const [selectedAccount, setSelectedAccount] =
        useState< InjectedAccountWithMeta | undefined>();
    const [providerLocation, setProviderLocation] = useState("");
    const [loading, setLoading] = useState(false);

    const { hcProvider, updateProviderRegDetails, updateProviderAccount,
        updateProviderKeyDetails, refreshProviderFromDB } = useEHRContext();
    const { allExtensionAccounts,
        w3Setup} = useEHRW3Context();

    interface FormElements extends HTMLFormControlsCollection {
        nameToRegister: HTMLInputElement;
        specialtyToRegister: HTMLInputElement;
        locationToRegister: HTMLInputElement;
    }
    interface EHRRegFormElement extends HTMLFormElement {
        readonly elements: FormElements;
    }
    /* comment out because we can't use await here.
    useEffect(() => {
        refreshProviderFromDB(); //make sure that we're not looking at the default
        await w3Setup();  //ensure extensions and w3 API providers are set up
    },[]);*/


    useEffect(() => {
        // declare the async data fetching function
        const contextAsyncW3Setup = async () => {
          // get the data from the api
          refreshProviderFromDB(); //make sure that we're not looking at the default
          await w3Setup();   //ensure extensions and w3 API providers are set up
          // set state with the result
          //setData(json);
        }

        // call the function
        contextAsyncW3Setup()
            // make sure to catch any error
            .catch(err => console.error(err));
    }, []);

    const handleRegistration = async (e: FormEvent<EHRRegFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (!selectedAccount && allExtensionAccounts &&
                allExtensionAccounts.length > 0) {
                //we have the extensions but no account chosen nor any in storage
                //select one to continue
                alert("Please select an account to continue with");
                return;
            }
            if (hcProvider.account.address.length == 1) {
                console.log("Could still be initial provider, update it.");
                refreshProviderFromDB();
            }
            console.log("registering with these values:");
            console.log(`N ${providerName}, S ${providerSpecialty},
                L ${providerLocation}`);
            { //unnamed block that updates web3 and DB
                if(selectedAccount){ //could be stored or from extension
                    if (selectedAccount.address != DEFAULT_INVALID_ADDR) {
                        //invalid: create a new account
                        processNewAccount();
                    } else if (selectedAccount.address ==
                        hcProvider.account.address) {
                            //valid stored address; use this to sign!
                            const signingAccount = hcProvider.account;
                            const signingKey = hcProvider.secretKey;
                            const publicKey = hcProvider.publicKey;
                            //Register with back end here
                    } else {
                        //Account is from extension, so don't store:
                        //Register with back end here using extension ac.
                    }
                } else { //nothing selected and no extension so create a new one
                    processNewAccount();
                }
                //web3 bit done, add to indexedDB here
                updateProviderRegDetails(
                    providerName, providerSpecialty, providerLocation);
                setLoading(false);
            }
        } catch(err) {
            console.log(`could not register, error is ${err}`);
            setLoading(false);
        }
    }

    const processNewAccount = async() => {
        const createdAccountWithKeys = await createAccountFromScratch();
        //store the update
        if (createdAccountWithKeys) {
            updateProviderAccount(createdAccountWithKeys.theNewAccount);
            updateProviderKeyDetails(
                createdAccountWithKeys.keyPair.publicKey,
                createdAccountWithKeys.keyPair.secretKey);
            setSelectedAccount(createdAccountWithKeys.theNewAccount);
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
        return createdAccountWithKeys;
        //useState(createdAccountWithKeys);
        //return { theNewAccount, keyPair}; //can't return through interface?
    }

    const handleAccountSelection = async(e: ChangeEvent<HTMLSelectElement>) => {
        const selectedAddress =  e.target.value;
        console.log("In a/c selection, selected address is " + selectedAddress);
        if(allExtensionAccounts) {
            const account: InjectedAccountWithMeta | undefined =
                allExtensionAccounts.find(account => account.address == selectedAddress);
            if(account) {
                setSelectedAccount(account);
            } else {
                throw Error("That account cannot be selected" + selectedAddress);
            }
        }
    }
    return (
        <div>
        <div>EHR Container Component</div>
            <div>

                {typeof allExtensionAccounts !== 'undefined' &&
                allExtensionAccounts.length > 0 && selectedAccount ?
                    selectedAccount.address : "No W3 address selected yet."}
                {typeof allExtensionAccounts !== 'undefined' &&
                allExtensionAccounts.length > 0 &&
                    !selectedAccount ? (
                <>
                    <select onChange={handleAccountSelection}>
                    {hcProvider?.account?.address?.length > 1 &&
                    <option key={hcProvider.account.address}
                        value={hcProvider.account.address}>
                            Stored: {hcProvider.account.meta.name}&nbsp;
                            -&nbsp;{hcProvider.account.address}
                    </option>}
                    <option defaultValue={""}>Select account...</option>
                    {allExtensionAccounts.map((account) =>
                        <option key={account.address} value={account.address}>
                        {account.meta.name} - {account.address}
                        </option>)
                    }
                    </select>
                </>) : null
                }
            </div>
            <form onSubmit={handleRegistration}>
                Name:&nbsp;<input
                    type="text"
                    id="nameToRegister"
                    defaultValue = {hcProvider.name}
                    placeholder = "Provider or Practice Organisation Name"
                    onChange={(e) => setProviderName(e.target.value)}
                /><br/>
                Specialty:&nbsp;<input
                    type="text"
                    id="specialtyToRegister"
                    defaultValue = {hcProvider.specialty}
                    placeholder = "Specialty (e.g. GP or Radiologist)"
                    onChange={(e) => setProviderSpecialty(e.target.value)}
                /><br/>
                Location:&nbsp;<input
                    type="text"
                    id="locationToRegister"
                    defaultValue = {hcProvider.location}
                    placeholder = "General Location (e.g. nearest city)"
                    onChange={(e) => setProviderLocation(e.target.value)}
                />
                <p>&nbsp;</p>
                <button type="submit" className="btn px-3 py-1 bg-teal-500 text-white decoration-slate-600 rounded-lg">
                    {loading ? "Loading..." : "Register"}
                </button>
            </form>
        </div>
    )
}

export default EHRContainer;