"use client"

import React, { FormEvent, useState} from "react";
import { useEHRContext } from "./context/EHRContext";


const EHRContainer = () => {

    const [providerName, setProviderName] = useState("");
    const [providerSpecialty, setProviderSpecialty] = useState("");
    const [providerLocation, setProviderLocation] = useState("");
    const [loading, setLoading] = useState(false);

    const { hcProvider, updateProviderRegDetails } = useEHRContext();

    interface FormElements extends HTMLFormControlsCollection {
        nameToRegister: HTMLInputElement;
        specialtyToRegister: HTMLInputElement;
        locationToRegister: HTMLInputElement;
    }
    interface EHRRegFormElement extends HTMLFormElement {
        readonly elements: FormElements;
    }

    const handleRegistration = async (e: FormEvent<EHRRegFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log("registering with these values:");
            console.log(`N ${providerName}, S ${providerSpecialty},
                L ${providerLocation}`);
            //register with back end here

            //add to indexedDB here
            updateProviderRegDetails(
                providerName, providerSpecialty, providerLocation);
            setLoading(false);
        } catch(err) {
            console.log(`could not register, error is ${err}`);
            setLoading(false);
        }
    }
    return (
        <div>
        <div>EHR Container Component</div>
            <form onSubmit={handleRegistration}>
                Name:&nbsp;<input
                    type="text"
                    id="nameToRegister"
                    value = {hcProvider.name}
                    placeholder = "Provider or Practice Organisation Name"
                    onChange={(e) => setProviderName(e.target.value)}
                /><br/>
                Specialty:&nbsp;<input
                    type="text"
                    id="specialtyToRegister"
                    value = {hcProvider.specialty}
                    placeholder = "Specialty (e.g. GP or Radiologist)"
                    onChange={(e) => setProviderSpecialty(e.target.value)}
                /><br/>
                Location:&nbsp;<input
                    type="text"
                    id="locationToRegister"
                    value = {hcProvider.location}
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