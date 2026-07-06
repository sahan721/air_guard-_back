import { useEffect, useState } from "react";


import {

  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,

} from "recharts";



import {

  getCurrentReading,
  getPrediction,
  getHistoryReadings,

} from "../services/api";



import type {

  CurrentReading,
  Prediction,
  HistoryReading,

} from "../types/airQuality";






export default function Dashboard() {


  const [reading, setReading] =
    useState<CurrentReading | null>(null);


  const [prediction, setPrediction] =
    useState<Prediction | null>(null);


  const [history, setHistory] =
    useState<HistoryReading[]>([]);







  const loadData = async () => {


    try {


      const current =
        await getCurrentReading();


      const ai =
        await getPrediction();


      const historyResult =
        await getHistoryReadings();



      setReading(current);


      setPrediction(ai);


      setHistory(historyResult);



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







  const getAQIStatus = () => {


    if (reading.aqi <= 50)

      return "Good";


    if (reading.aqi <= 100)

      return "Moderate";


    if (reading.aqi <= 150)

      return "Unhealthy Sensitive";


    if (reading.aqi <= 200)

      return "Unhealthy";


    return "Hazardous";


  };









  return (


    <div>



      <h1 className="text-3xl font-bold mb-8">

        AirGuard Dashboard

      </h1>










      {/* CARDS */}


      <div className="grid grid-cols-4 gap-6">









        {/* AQI */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Current AQI

          </p>


          <h2 className="text-5xl font-bold text-cyan-400 mt-3">

            {reading.aqi}

          </h2>


          <p className="mt-2 text-gray-400">

            {getAQIStatus()}

          </p>


        </div>










        {/* SENSOR */}


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


            {reading.minutes_since_update} min ago


          </p>



        </div>











        {/* TEMP */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Temperature

          </p>


          <h2 className="text-4xl mt-3">

            {reading.temperature} °C

          </h2>


        </div>










        {/* HUMIDITY */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Humidity

          </p>


          <h2 className="text-4xl mt-3 text-blue-400">

            {reading.humidity} %

          </h2>


        </div>










        {/* PM2.5 */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            PM2.5

          </p>


          <h2 className="text-4xl mt-3 text-orange-400">

            {reading.pm2_5}

          </h2>


          <p className="text-gray-500">

            µg/m³

          </p>


        </div>










        {/* PM10 */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            PM10

          </p>


          <h2 className="text-4xl mt-3 text-yellow-400">

            {reading.pm10}

          </h2>


          <p className="text-gray-500">

            µg/m³

          </p>


        </div>










        {/* AI */}


        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            AI Risk

          </p>


          <h2 className="text-3xl mt-3 text-cyan-400">

            {prediction?.risk_level}

          </h2>


        </div>




      </div>









      {/* GRAPH */}


      <div className="bg-slate-900 rounded-xl p-6 mt-8">


        <h2 className="text-xl font-bold mb-5">

          24 Hour AQI History

        </h2>



        <ResponsiveContainer
          width="100%"
          height={300}
        >


          <LineChart data={history}>


            <XAxis dataKey="recorded_at" />


            <YAxis />


            <Tooltip />


            <Line

              type="monotone"

              dataKey="aqi"

              strokeWidth={3}

            />


          </LineChart>


        </ResponsiveContainer>


      </div>










      {/* AI RECOMMENDATION */}


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