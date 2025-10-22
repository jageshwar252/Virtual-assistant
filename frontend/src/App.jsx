import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignIN from './pages/SignIN'
import SignUP from './pages/SignUP'
import Customize from './pages/Customize'
import Home from './pages/Home'
import { useContext } from 'react'
import { UserDataContext } from './context/UserContext'
import Customize2 from './pages/Customize2'

const App = () => {

  const { userData, setUserData } = useContext(UserDataContext);

  return (
    <Routes>
      <Route path='/' element={ (userData?.assistantName && userData?.assistantImage ) ? <Home /> : <Navigate to={'/customize'} />} />
      <Route path='signin' element={ (!userData) ? <SignIN /> : <Navigate to={'/'} />} />
      <Route path='signup' element={ (!userData) ? <SignUP /> : <Navigate to={'/'} />} />
      <Route path='/customize' element={ userData ? <Customize /> : <Navigate to={'/signup'} />} />
      <Route path='/customize2' element={ userData ? <Customize2 /> : <Navigate to={'/signup'} />} />
    </Routes>
  )
}

export default App
