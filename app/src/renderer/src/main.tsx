import '@fontsource/inter'
import '@fontsource/inter/600.css' //semi-bold
// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/main.css'
import { startTask } from './backgroundFetcher'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  //<React.StrictMode>
  <App />
  //</React.StrictMode>
)

startTask()
