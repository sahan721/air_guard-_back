export interface CurrentReading {

  device_id: number;

  recorded_at: string;


  pm1_0: string;

  pm2_5: string;

  pm10: string;


  temperature: string;

  humidity: string;


  aqi: number;


  sensor_online: boolean;

  minutes_since_update: number;

}




export interface Prediction {


  device_id: number;


  predicted_at: string;

  predicted_for: string;


  pm1_0: string;

  pm2_5: string;

  pm10: string;


  temperature: string;

  humidity: string;


  aqi: number;


  risk_level: string;

  reason: string;

  recommendation: string;


}