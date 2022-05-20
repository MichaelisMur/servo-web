import React from 'react'
import './style/App.css'
import Home from './Home'
import {Routes, Route} from 'react-router-dom'
import Main from './Main'
import User from './User'
import Finance from './Finance'
import Emotion from './Emotion'
import Steps from './Steps'

const App = () => {
  return(
      <Routes>
        <Route exact path='/account' element={<User/>}/>
        <Route exact path='/finance' element={<Finance/>}/>
        <Route exact path='/emotion' element={<Emotion/>}/>
        <Route exact path='/steps' element={<Steps/>}/>
        <Route exact path='/' element={
          localStorage.getItem("email") && localStorage.getItem('refreshTokenExpiresIn') > Date.now() ? 
          <Main/> : <Home/>}
        />
      </Routes>
  )
}

export default App;