import { useEffect, useState } from "react";


import {

  getDevices,

} from "../services/api";


import type {

  Device,

} from "../types/airQuality";






export default function Devices() {


  const [devices, setDevices] =
    useState<Device[]>([]);





  async function loadDevices() {


    try {


      const data =
        await getDevices();



      setDevices(
        data
      );



    } catch (error) {


      console.log(
        "Device loading failed",
        error
      );


    }


  }






  useEffect(() => {


  const fetchDevices = async () => {


    await loadDevices();


  };



  fetchDevices();



}, []);








  return (


    <div>



      <h1 className="text-3xl font-bold mb-8">

        Device Management

      </h1>






      <div className="bg-slate-900 rounded-xl overflow-hidden">



        <table className="w-full">



          <thead className="bg-slate-800">



            <tr>



              <th className="p-4 text-left">

                ID

              </th>


              <th className="p-4 text-left">

                Device

              </th>


              <th className="p-4 text-left">

                Location

              </th>


              <th className="p-4 text-left">

                AQI

              </th>


              <th className="p-4 text-left">

                Status

              </th>




            </tr>



          </thead>








          <tbody>



            {


              devices.map(

                (device) => (


                  <tr

                    key={device.device_id}

                    className="border-t border-slate-700"

                  >




                    <td className="p-4">


                      {device.device_id}


                    </td>





                    <td className="p-4">


                      {device.device_name}


                    </td>






                    <td className="p-4">


                      {device.location_name}


                    </td>








                    <td className="p-4 text-cyan-400 font-bold">



                      {

                        device.current_readings?.aqi
                        ??
                        "No Data"

                      }



                    </td>








                    <td className="p-4">



                      <span

                        className={

                          device.status === "Active"

                          ? "text-green-400"

                          : "text-red-400"

                        }

                      >


                        {device.status}


                      </span>



                    </td>





                  </tr>


                )

              )


            }



          </tbody>




        </table>



      </div>



    </div>


  );


}