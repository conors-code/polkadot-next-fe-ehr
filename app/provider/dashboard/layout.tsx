import { flushSync } from "react-dom";
import  Dashboard from "./Dashboard"


export default function RootLayout({
    children
} : {
    children:React.ReactNode;
}) {
    const isRegistered = false;
    return (
        <main className="flex space-x-4 divide-x-2 p-5">
            <div>
                <h1>Dashboard</h1>
            </div>
            <div className="flex-1 pl-5">
                
                {!isRegistered &&
                  <Dashboard />
                }

                <div>{children}</div>
            </div>
        </main>
    );
}