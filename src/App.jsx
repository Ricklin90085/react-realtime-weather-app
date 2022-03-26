import { useState, useEffect, useMemo } from 'react'
import { css, ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'

import WeatherCard from './WeatherCard'
import WeatherSetting from './WeatherSetting'

import useWeatherApi from './useWeatherApi'
import { findLocation } from './utils'

import sunriseAndSunsetData from './sunrise-sunset.json';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const buttonDefault = () => css`
  display: block;
  width: 120px;
  height: 30px;
  font-size: 14px;
  background-color: transparent;
  color: #212121;
`;

const rejectButton = styled.button`
  ${buttonDefault}
  background-color: red;
`

const acceptButton = styled.button`
  ${buttonDefault}
  background-color: green;
`

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const getMoment = (locationName) => {
  const location = sunriseAndSunsetData.find((data) => {
    return data.locationName === locationName
  })

  if (!location) {
    return null
  }

  const now = new Date()

  const nowDate = Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replace(/\//g, '-')
  
  const locationDate = location.time && location.time.find((time) => time.dataTime === nowDate)

  const sunriseTimestamp = new Date(`${locationDate.dataTime} ${locationDate.sunrise}`).getTime()
  const sunsetTimestamp = new Date(`${locationDate.dataTime} ${locationDate.sunset}`).getTime()
  const nowTimestamp = now.getTime()

  return sunriseTimestamp <= nowTimestamp && nowTimestamp <= sunsetTimestamp ? 'day' : 'night'
}


function App() {
  console.log('--- invoke function component ---');

  const storageCity = localStorage.getItem('cityName')

  const [currentTheme, setCurrentTheme] = useState('light')
  const [currentPage, setCurrentPage] = useState('WeatherCard')
  const [currentCity, setCurrentCity] = useState(storageCity || '臺北市')

  const currentLocation = findLocation(currentCity) || {}
  console.log(currentLocation);

  const { weatherElement, fetchData } = useWeatherApi(currentLocation)

  const {
    locationName,
    isLoading,
  } = weatherElement;

  const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [locationName])

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {console.log('render isLoading', isLoading)}
        {currentPage === 'WeatherCard' && (
          <WeatherCard
            cityName={currentLocation.cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === 'WeatherSetting' && (
          <WeatherSetting cityName={currentLocation.cityName} setCurrentCity={setCurrentCity} setCurrentPage={setCurrentPage} />
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
