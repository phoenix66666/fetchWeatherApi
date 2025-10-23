


//https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,precipitation_sum,temperature_2m_min,apparent_temperature_max,apparent_temperature_min&hourly=temperature_2m,weather_code,wind_speed_10m,apparent_temperature,precipitation&current=temperature_2m,weather_code,wind_speed_10m&timezone=America%2FLos_Angeles&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch


export function getWeather(lat,lon,timezone1){
    const params = {
        latitude:lat,
        longitude:lon,
        timezone:timezone1,
};
const queryString = new URLSearchParams(params).toString();

return axios.get("https://api.open-meteo.com/v1/forecast?"+`${queryString}`+"&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&hourly=temperature_2m,wind_speed_10m,apparent_temperature,precipitation,weather_code&current=wind_speed_10m,temperature_2m,apparent_temperature,precipitation,weather_code&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch").then(({data})=>{
     return{
        current: parseCurrentWeather(data) ,
        daily: parseDailyWeather(data),
        hourly:parseHourlyWeather(data)
    }
})
}

function parseCurrentWeather({current,daily})
{
    const { temperature_2m:currentTemp, wind_speed_10m:windSpeed, weather_code:iconCode}=current

    const{
        temperature_2m_max: [maxTemp],
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        apparent_temperature_min: [minFeelsLike],
        precipitation_sum: [precip],
    } = daily

    

    return{
        currentTemp,
        highTemp: maxTemp,
        lowTemp: minTemp,
        highFeelsLike: maxFeelsLike,
        lowFeelsLike: minFeelsLike,
        windSpeed,
        precip,
        iconCode,
    }

 }

 function parseDailyWeather({daily}){
    return daily.time.map((time,index) =>{
        return{
            timestamp:time*1000,
            iconCode:daily.weather_code[index],
            maxTemp:Math.round(daily.temperature_2m_max[index])
        }
    })
 }

 function parseHourlyWeather({hourly,current})
 {
    return hourly.time.map((time,index)=>{
        return{
            timestamp: time*1000,
            iconCode:hourly.weather_code[index],
            temp:Math.round(hourly.temperature_2m[index]),
            feelsLike:Math.round(hourly.apparent_temperature[index]),
            windSpeed:Math.round(hourly.wind_speed_10m[index]),
            precip:Math.round(hourly.precipitation[index]*100)/100,

        }

    }).filter(({timestamp})=> timestamp >= current.time * 1000)
 }