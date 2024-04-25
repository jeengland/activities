import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import { DiscordContextProvider } from './hooks/discordProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DiscordContextProvider>
      <App />
    </DiscordContextProvider>
  </React.StrictMode>,
)
