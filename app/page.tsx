import Link from "next/link";
import React from "react";

function Home() {
  return (
    <div className="p-5 text-teal-700 decoration-slate-600">
      <p className="font-bold">EHR homepage &gt;</p>
      <p>
        <Link href="/provider/prereg" className="px-3 py-1 bg-white text-teal-700 decoration-slate-600 rounded-lg">
          Register
        </Link>
      </p>
      <p>
        <Link href="/provider/postreg" className="px-3 py-1 bg-white text-teal-700 decoration-slate-600 rounded-lg">
          Dashboard
        </Link>
      </p>
    </div>
  )
}

export default Home;