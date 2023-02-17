
"use client";

import {useRouter} from "next/navigation";
import React, {FormEvent, useState} from "react";
import { db } from "../../../database.config";

function Register() {
    const [providerName, setProviderName] = useState("");
    const [providerSpecialty, setProviderSpecialty] = useState("");
    const [providerLocation, setProviderLocation] = useState("");
    const [address, setAddress] = useState("");

    const router = useRouter();

    const handleRegistration = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProviderName("");
        setProviderSpecialty("");
        setProviderLocation("");
        const addressHolder = providerName
        setAddress(addressHolder); //make it name until we can get key from IndexedDB
        await addProviderToDB();
        console.log(`about to router push, id is ${addressHolder}`);
        router.push(`/provider/dashboard`);
    }

    async function addProviderToDB() {
        //not needed anymore 
        /*
        try {
            const id = await db.hcProvider.add({
                address: 'testAddr',
                name:providerName,
                specialty: providerSpecialty,
                location:providerLocation,
                publicKey: new Uint8Array(),
                secretKey: new Uint8Array()
            });
            console.log(`${providerName} added to DB, id is ${id}.`)
        } catch (err) {
            console.log(`Didn't add ${providerName}, error is ${err}.`)
        } */
    }

    return (
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
  )
}

export default Register;