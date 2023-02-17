import { flushSync } from "react-dom";
import EHRW3ContextProvider from "../context/EHRW3ContextProvider";
import ProviderW3 from "./ProviderW3";


export default function RootLayout({
    children
} : {
    children:React.ReactNode;
}) {
    const isRegistered = false;
    return (
        <main className="flex space-x-4 divide-x-2 p-5">
            <div>
                <h1>Provider Actions</h1>
            </div>
            <div className="flex-1 pl-5">
                <EHRW3ContextProvider>
                    {children}
                    <ProviderW3 />
                </EHRW3ContextProvider>
            </div>
        </main>
    );
}