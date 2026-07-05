import Dashboard from "../pages/Dashboard";
import { Activity, Cpu, Brain } from "lucide-react";


export default function AdminLayout() {


  return (

    <div className="flex min-h-screen bg-slate-950 text-white">


      <aside className="w-64 bg-slate-900 p-6">


        <h1 className="text-2xl font-bold text-cyan-400 mb-10">

          AirGuard

        </h1>



        <nav className="space-y-5">


          <div className="flex gap-3 items-center">

            <Activity />

            Dashboard

          </div>



          <div className="flex gap-3 items-center">

            <Cpu />

            Devices

          </div>



          <div className="flex gap-3 items-center">

            <Brain />

            AI Predictions

          </div>


        </nav>


      </aside>



      <main className="flex-1 p-8">


        <Dashboard />


      </main>


    </div>

  );


}