import React, {useEffect} from 'react';

import {DiscordSDK} from '@discord/embedded-app-sdk';

import type {DiscordAuth} from '../types/DiscordTypes';

type DiscordContextProviderProps = {
  children: React.ReactNode
}

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

const DiscordContext = React.createContext<{
  auth: null | DiscordAuth,
  discordSdk: DiscordSDK
}>({auth: null, discordSdk});

/**
 * @function setupDiscordSdk
 * @description readies the Discord SDK and fetches the auth object
*/
async function setupDiscordSdk() {
  await discordSdk.ready();

  const {code} = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: [
      'identify',
      'guilds',
    ],
  });

  const response = await fetch('/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
    }),
  });

  const json = await response.json();

  const authObj = await discordSdk.commands.authenticate({
    access_token: json.access_token,
  });

  if (authObj === null) {
    throw new Error('Authenticate command failed');
  }

  return authObj;
}

const DiscordContextProvider = ({children}: DiscordContextProviderProps) => {
  const [auth, setAuth] = React.useState<DiscordAuth | null>(null);

  useEffect(() => {
    setupDiscordSdk()
        .then((res) => setAuth(res))
        .catch((err) => console.error(err));
  }, []);

  return (
    <DiscordContext.Provider value={{
      auth,
      discordSdk,
    }}>
      {children}
    </DiscordContext.Provider>
  );
};


export {
  DiscordContext,
  DiscordContextProvider,
};
