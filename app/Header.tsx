
import Link from "next/link";
import React from "react";
//Reference this in the layout.txt rather than Home (page.tsx) so that 
//it's available in each page.
function Header() {
  return (
    <header className="p-5 bg-teal-500">
        <h2 className="font-bold text-white">EHR Header</h2>
        <Link href="/" className="px-3 py-1 bg-white text-teal-700 decoration-slate-600 rounded-lg">
            Home
        </Link>
    </header>
  );
}

export default Header;