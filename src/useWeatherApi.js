import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = (locationName) => {
  console.log("fetchCurrentWeather", locationName);
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-38B8B40E-D06C-4510-8708-BE3CB633F9F5&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElement, item) => {
          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElement[item.elementName] = item.elementValue;
          }
          return neededElement;
        },
        {}
      );

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.parameter[0].parameterValue,
        description: "多雲時晴",
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
        isLoading: true,
      };
    });
};

const fetchWeatherForecast = (cityName) => {
  console.log("fetchWeatherForecast", cityName);

  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-38B8B40E-D06C-4510-8708-BE3CB633F9F5&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];

      const weatherElements = locationData.weatherElement.reduce(
        (neededElement, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElement[item.elementName] = item.time[0].parameter;
          }
          return neededElement;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const useWeatherApi = ({ locationName, cityName }) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true,
  });

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();
  }, [locationName, cityName]);

  useEffect(() => {
    console.log("useWeatherApi useEffect");
    fetchData();
  }, [fetchData]);

  return { weatherElement, fetchData };
};

export default useWeatherApi;
