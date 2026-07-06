const BASE_URL =
  "http://localhost:3000/api";



export async function getCurrentReading() {


  const response =
    await fetch(
      `${BASE_URL}/readings/current/1`
    );


  return response.json();


}





export async function getPrediction() {


  const response =
    await fetch(
      `${BASE_URL}/predictions/latest/1`
    );


  return response.json();


}

export async function getHistoryReadings() {


  const response =
    await fetch(
      `${BASE_URL}/readings/history/1`
    );


  if (!response.ok) {

    throw new Error(
      "Failed to get history"
    );

  }


  return response.json();


}

export async function getDevices() {


  const response =
    await fetch(
      "http://localhost:3000/devices"
    );



  if (!response.ok) {


    throw new Error(
      "Failed to load devices"
    );


  }



  return response.json();


}