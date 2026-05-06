import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import './index.css'

import App from './App'
import Login from './pages/Login'

ReactDOM.createRoot(document.getElementById('root')).render(

  <BrowserRouter>

    <Routes>

      <Route
        path="/"
        element={<App />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

    </Routes>

  </BrowserRouter>

)