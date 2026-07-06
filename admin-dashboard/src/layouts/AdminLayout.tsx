import { useState } from "react";


import {

  Activity,

  Cpu,

  Brain,

} from "lucide-react";



import Dashboard from "../pages/Dashboard";

import Devices from "../pages/Devices";

import Predictions from "../pages/Predictions";








export default function AdminLayout() {


  const [page, setPage] =
    useState("dashboard");







  return (


    <div className="flex min-h-screen bg-slate-950 text-white">






      <aside className="w-64 bg-slate-900 p-6">






        <h1 className="text-2xl font-bold text-cyan-400 mb-10">


          AirGuard


        </h1>








        <nav className="space-y-5">








          <button

            onClick={() =>
              setPage("dashboard")
            }


            className="flex gap-3 items-center hover:text-cyan-400"

          >


            <Activity />


            Dashboard


          </button>











          <button

            onClick={() =>
              setPage("devices")
            }


            className="flex gap-3 items-center hover:text-cyan-400"

          >


            <Cpu />


            Devices


          </button>











          <button


            onClick={() =>
              setPage("predictions")
            }


            className="flex gap-3 items-center hover:text-cyan-400"


          >


            <Brain />


            AI Predictions


          </button>







        </nav>






      </aside>









      <main className="flex-1 p-8">






        {

          page === "dashboard"

          &&

          <Dashboard />

        }








        {

          page === "devices"

          &&

          <Devices />

        }








        {

          page === "predictions"

          &&

          <Predictions />

        }






      </main>







    </div>


  );


}