
"use client";

import { db } from "../../../database.config";
import { useLiveQuery } from "dexie-react-hooks";
import {useRouter} from "next/navigation";
import React, {FormEvent, useState, useEffect, ChangeEvent} from "react";

import { ApiPromise, WsProvider } from '@polkadot/api';
//from https://polkadot.js.org/docs/extension/usage/
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
//from https://polkadot.js.org/docs/util-crypto/examples/create-mnemonic/
import { cryptoWaitReady, mnemonicGenerate, mnemonicToMiniSecret,
         mnemonicValidate, sr25519PairFromSeed
  } from '@polkadot/util-crypto';
//from https://polkadot.js.org/docs/keyring/start/create
import { Keyring } from '@polkadot/keyring';


function Dashboard() {
    const DAPP_NAME_FOR_CONNECTION = "EHR DApp";

    const [w3Api, setW3Api] =  useState<ApiPromise>();
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta>();
    //assume that we don't have an account/address stored until we can retrieve one.
    let isAccountStoredAlready = false;
    //Get a ref on indexedDB so we can see if we have an account there.  Just get the first entry:
    //  there should only be 1.
    const hcProviderDetails = useLiveQuery(
      () => db.hcProvider.orderBy('account').first()
    );

    const setup = async() => {
      const providerURL = process.env.NEXT_PUBLIC_WS_PROVIDER_URL;
      console.log("providerURL is" + providerURL);
      const wsProvider = new WsProvider(process.env.NEXT_PUBLIC_WS_PROVIDER_URL);
      const w3Api = await ApiPromise.create({ provider: wsProvider });
      setW3Api(w3Api); //specify generic <ApiPromise> in useState above to stop the error here.
    }

    //common dApp logic
    //from https://polkadot.js.org/docs/extension/usage/ and
    // Pedro's Oh My Function series https://www.youtube.com/watch?v=JxIZD0hbobQ
    const connectMe = async() => {
      const extensions = await web3Enable(DAPP_NAME_FOR_CONNECTION);
      let allExtensionAccounts:InjectedAccountWithMeta[] | undefined = undefined;
      let allGeneratedAccounts:InjectedAccountWithMeta[] | undefined = undefined;


      if(!extensions || (extensions.length == 0)) {
        //throw Error("No extensions in this browser");
        console.log("No extensions in this browser - creating account");
        const {isGeneratedAccountStored, theStoredAccountArray} = await getLocallyStoredAccount();
        isAccountStoredAlready = isGeneratedAccountStored;
        allGeneratedAccounts = theStoredAccountArray;

      } else {
        //if we have an account stored use that, otherwise offer choice from extension
        const {isGeneratedAccountStored, theStoredAccountArray} = getLocalAccountIfAlreadyExists();
        if (!isGeneratedAccountStored) { //need to pick one from the extension
          console.log(`Found ${extensions.length} extensions in this browser:`);
          for (let index = 0; index < extensions.length; index++) {
            const extension = extensions[index];
            console.log("ext name: " + extension.name + "ext provider: " + extension.provider);
          } /*
          extensions.map(
            (extension) => (
              console.log("ext name: " + extension.name + "ext provider: " + extension.provider);
            )
          ); */
          allExtensionAccounts = await web3Accounts();
        } else {
          //use the stored account
          isAccountStoredAlready = isGeneratedAccountStored;
          allGeneratedAccounts = theStoredAccountArray;
        }
      }

      const allAccounts = (allExtensionAccounts === undefined ? allGeneratedAccounts : allExtensionAccounts);
      console.log("JSON stringify allAccounts:");
      console.log(JSON.stringify(allAccounts));

      if(allAccounts && allAccounts.length > 0) {
        setAccounts(allAccounts);
      }

      if(allAccounts?.length == 1) { //no need to choose which to select
        if(!isAccountStoredAlready) {
          //we don't & shouldn't have the key nor secret here; they're managed in the extension
          storeAccountDetails(allAccounts[0], new Uint8Array(), new Uint8Array());
        }
        setSelectedAccount(allAccounts[0]);
      }
    }

    function getLocalAccountIfAlreadyExists() {
      if (hcProviderDetails?.account?.address) {
        const theExistingAccount = hcProviderDetails.account;
        const theStoredAccountArray:InjectedAccountWithMeta[] = [theExistingAccount];
        //return the one we have stored & true that it is stored already
        return {isGeneratedAccountStored: true, theStoredAccountArray};
      } else {
        return  {isGeneratedAccountStored: false, theStoredAccountArray: undefined};
      }
    }

    function getLocallyStoredAccount() {
      if (!hcProviderDetails?.account?.address) {
        return createAccountFromScratch();
      } else {
        const theExistingAccount = hcProviderDetails.account;
        const theStoredAccountArray:InjectedAccountWithMeta[] = [theExistingAccount];
        //return the one we have stored & true that it is stored already
        return {isGeneratedAccountStored: true, theStoredAccountArray};
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

      const theStoredAccountArray:InjectedAccountWithMeta[] = [theNewAccount];
      //store the account and key, secret
      storeAccountDetails(theNewAccount, keyPair.publicKey, keyPair.secretKey);
      return {isGeneratedAccountStored: true, theStoredAccountArray};
      /* //this is the shape of InjectedAccountWithMeta:
      export interface InjectedAccountWithMeta {
        address: string;
        meta: {
            genesisHash?: string | null;
            name?: string;
            source: string;
        };
        type?: KeypairType;
      */
    }

    //this runs *before* the w3Api is created, to create it
    useEffect(() => {
      setup();
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


    useEffect(() => {
      connectMe();
    }, []);

    useEffect(() => {
      if (hcProviderDetails) {
        console.log("hcProviderDetails Name is " + hcProviderDetails.name);
        console.log("hcProviderDetails Specialty is " + hcProviderDetails.specialty);
        console.log("hcProviderDetails Location is " + hcProviderDetails.location);
        setProviderName(hcProviderDetails.name);
        setProviderSpecialty(hcProviderDetails.specialty);
        setProviderLocation(hcProviderDetails.location);
      } else {
        console.log("hcProviderDetails is not set");
      }
    });

    const [providerName, setProviderName] = useState(hcProviderDetails?.name);
    const [providerSpecialty, setProviderSpecialty] = useState(hcProviderDetails?.specialty);
    const [providerLocation, setProviderLocation] = useState(hcProviderDetails?.location);
    const [providerAddress, setProviderAddress] = useState(hcProviderDetails?.account.address);

    async function storeAccountDetails(
      theNewAccount: InjectedAccountWithMeta,
      publicKeyToStore: Uint8Array,
      secretKeyToStore: Uint8Array
    ) {
      try {
          const id = await db.hcProvider.add({
              id: 1,
              account: theNewAccount,
              name: '',//providerName,
              specialty: '',//providerSpecialty,
              location: '',//providerLocation,
              publicKey: publicKeyToStore,
              secretKey: secretKeyToStore
          });
          console.log(`account added to DB, address is ${theNewAccount.address}.`);
          return theNewAccount.address;
      } catch (err) {
          console.log(`Didn't add ${providerName}, error is ${err}.`);
          return 0;
      }
    }


    const handleAccountSelection = async(e: ChangeEvent<HTMLSelectElement>) => {
      const selectedAddress =  e.target.value;
      console.log("In a/c selection, selected address is " + selectedAddress);
      const account = accounts.find(account => account.address == selectedAddress);
      if(account) {
        setSelectedAccount(account);
      } else {
        throw Error("That account cannot be selected" + selectedAddress);
      }
    }

    const router = useRouter(); //send off to the 'next steps' page.
    const handleRegistration = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("You clicked to register");
        //need to call the chain here.  Can store locally too
        await addProviderNameSpecialtyAddressToDB(
          providerName? providerName : '',
          providerSpecialty? providerSpecialty : '',
          providerLocation? providerLocation : '');
        console.log(`about to router push`);
        router.push(`/provider/dashboard`);
    }

async function addProviderNameSpecialtyAddressToDB(
  providerName: string ,
  providerSpecialty: string ,
  providerLocation: string) {
    try {
          const accountToUpdate = await db.hcProvider
            .where('address').equals('"' + providerAddress + '"')
            .modify(theProvider => {
              theProvider.name = providerName,
              theProvider.specialty = providerSpecialty,
              theProvider.location = providerLocation
            });
          console.log(`${providerAddress} updated in DB, id is.`)
    } catch (err) {
        console.log(`Didn't add ${providerName}, error is ${err}.`)
    }

}
  return (
    <div>
    <div className="font-bold">Chain Address {providerAddress}</div><br/>
      <div>Name {providerName}</div><br/>
      <div>Specialty {providerSpecialty}</div><br/>
      <div>Location {providerLocation}</div><br/>

      <div>

        {accounts.length > 0 && selectedAccount ? selectedAccount.address : null }
        {accounts.length > 0 && !selectedAccount ? (
          <>
            <select onChange={handleAccountSelection}>
              <option defaultValue={""}>Select account...</option>
              {accounts.map((account) =>
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
            value = {providerName}
            placeholder = "Provider or Practice Organisation Name"
            onChange={(e) => setProviderName(e.target.value)}
        /><br/>
        Specialty:&nbsp;<input
            type="text"
            value = {providerSpecialty}
            placeholder = "Specialty (e.g. GP or Radiologist)"
            onChange={(e) => setProviderSpecialty(e.target.value)}
        /><br/>
        Location:&nbsp;<input
            type="text"
            value = {providerLocation}
            placeholder = "General Location (e.g. nearest city)"
            onChange={(e) => setProviderLocation(e.target.value)}
        />
        <p>&nbsp;</p>
        <button type="submit" className="btn px-3 py-1 bg-teal-500 text-white decoration-slate-600 rounded-lg">
            Register
        </button>
    </form>
    </div>
  )
}

export default Dashboard;


