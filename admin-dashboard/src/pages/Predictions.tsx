import { useEffect, useState } from "react";


import {

  getPrediction,

} from "../services/api";


import type {

  Prediction,

} from "../types/airQuality";





export default function Predictions() {


  const [prediction, setPrediction] =
    useState<Prediction | null>(null);





  async function loadPrediction() {


    try {


      const data =
        await getPrediction();


      setPrediction(
        data
      );


    } catch (error) {


      console.log(
        "Prediction loading failed",
        error
      );


    }


  }






  useEffect(() => {


    const fetchPrediction = async () => {


      await loadPrediction();


    };


    fetchPrediction();


  }, []);






  if (!prediction) {


    return (

      <p className="text-cyan-400">

        Loading prediction...

      </p>

    );


  }






  return (


    <div>



      <h1 className="text-3xl font-bold mb-8">


        AI Prediction


      </h1>







      <div className="grid grid-cols-4 gap-6">






        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Predicted AQI

          </p>


          <h2 className="text-5xl text-cyan-400 font-bold">


            {prediction.aqi}


          </h2>



        </div>









        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            Risk Level

          </p>


          <h2 className="text-3xl">


            {prediction.risk_level}


          </h2>



        </div>








        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">

            PM2.5


          </p>


          <h2 className="text-3xl">


            {prediction.pm2_5}


          </h2>


        </div>








        <div className="bg-slate-900 p-5 rounded-xl">


          <p className="text-gray-400">


            PM10


          </p>


          <h2 className="text-3xl">


            {prediction.pm10}


          </h2>


        </div>






      </div>









      <div className="bg-slate-900 rounded-xl p-6 mt-8">



        <h2 className="text-xl font-bold">

          AI Analysis

        </h2>




        <p className="mt-5 text-gray-300">


          {prediction.reason}


        </p>



        <p className="mt-5 text-cyan-400">


          {prediction.recommendation}


        </p>



      </div>





    </div>


  );


}