import { flushSync } from "react-dom";
import  Register from "./Register"


export default function RootLayout({
    children
} : {
    children:React.ReactNode;
}) {
    return (
        <main className="flex space-x-4 divide-x-2 p-5">
            <div>
                <h1>Registration</h1>
            </div>
            <div className="flex-1 pl-5">
                <Register />
                <div>{children}</div>
            </div>
        </main>
    );
}