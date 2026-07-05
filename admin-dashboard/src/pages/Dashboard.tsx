import { useEffect, useState } from "react";


import {
  getCurrentReading,
  getPrediction,
} from "../services/api";


import type {
  CurrentReading,
  Prediction,
} from "../types/airQuality";





export default function Dashboard() {


  const [reading, setReading] =
    useState<CurrentReading | null>(null);


  const [prediction, setPrediction] =
    useState<Prediction | null>(null);





  const loadData = async () => {


    try {


      const current =
        await getCurrentReading();


      const ai =
        await getPrediction();



      setReading(
        current
      );


      setPrediction(
        ai
      );



    } catch (error) {


      console.log(
        "Dashboard data loading failed:",
        error
      );


    }


  };






  useEffect(() => {


    const fetchData = async () => {


      await loadData();


    };


    fetchData();


  }, []);








  if (!reading) {


    return (

      <div className="h-screen flex items-center justify-center">


        <p className="text-cyan-400 text-xl">

          Loading dashboard...

        </p>


      </div>

    );


  }








  return (

    <div>


      <h1 className="text-3xl font-bold mb-8">

        AirGuard Dashboard

      </h1>







      <div className="grid grid-cols-4 gap-6">






        {/* AQI CARD */}

        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Current AQI

          </p>



          <h2 className="text-5xl font-bold text-cyan-400 mt-3">

            {reading.aqi}

          </h2>


        </div>








        {/* SENSOR STATUS */}

        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Sensor Status

          </p>



          <h2
            className={

              reading.sensor_online

              ? "text-green-400 text-3xl mt-3"

              : "text-red-400 text-3xl mt-3"

            }
          >


            {
              reading.sensor_online
              ? "ONLINE"
              : "OFFLINE"
            }


          </h2>


          <p className="text-gray-500 mt-2">

            Last update {reading.minutes_since_update} min ago

          </p>


        </div>








        {/* TEMPERATURE */}

        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Temperature

          </p>



          <h2 className="text-4xl mt-3">

            {reading.temperature} °C

          </h2>


        </div>









        {/* AI */}

        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            AI Prediction

          </p>



          <h2 className="text-3xl mt-3 text-cyan-400">

            {prediction?.risk_level}

          </h2>


        </div>



      </div>







      <div className="bg-slate-900 rounded-xl p-6 mt-8">


        <h2 className="text-xl font-bold mb-4">

          AI Recommendation

        </h2>


        <p className="text-gray-300">

          {prediction?.recommendation}

        </p>


        <p className="text-gray-500 mt-4">

          {prediction?.reason}

        </p>



      </div>




    </div>

  );


}