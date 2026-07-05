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