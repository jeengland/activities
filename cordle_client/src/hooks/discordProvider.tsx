import React, { useEffect } from 'react'

import { DiscordSDK } from '@discord/embedded-app-sdk';

interface DiscordAuth {
  access_token: string;
  user: {
      username: string;
      discriminator: string;
      id: string;
      public_flags: number;
      avatar?: string | null | undefined;
      global_name?: string | null | undefined;
  };
  scopes: (-1 | "identify" | "email" | "connections" | "guilds" | "guilds.join" | "guilds.members.read" | "gdm.join" | "rpc" | "rpc.notifications.read" | "rpc.voice.read" | "rpc.voice.write" | "rpc.video.read" | "rpc.video.write" | "rpc.screenshare.read" | "rpc.screenshare.write" | "rpc.activities.write" | "bot" | "webhook.incoming" | "messages.read" | "applications.builds.upload" | "applications.builds.read" | "applications.commands" | "applications.commands.update" | "applications.commands.permissions.update" | "applications.store.update" | "applications.entitlements" | "activities.read" | "activities.write" | "relationships.read" | "voice" | "dm_channels.read" | "role_connections.write")[];
  expires: string;
  application: {
      id: string;
      description: string;
      name: string;
      icon?: string | null | undefined;
      rpc_origins?: string[] | undefined;
  };
}

type DiscordContextProviderProps = {
  children: React.ReactNode
}

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID)

const DiscordContext = React.createContext<{ auth: null | DiscordAuth, discordSdk: DiscordSDK}>({ auth: null, discordSdk });


async function setupDiscordSdk() {  
  await discordSdk.ready();

  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "guilds"
    ]
  })

  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    })
  })

  const { access_token } = await response.json();

  const auth_obj = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth_obj === null) {
    throw new Error("Authenticate command failed");
  }

  return auth_obj;
}

const DiscordContextProvider = ({ children }: DiscordContextProviderProps) => {
  const [auth, setAuth] = React.useState<DiscordAuth | null>(null);

  useEffect(() => {
    setupDiscordSdk()
      .then(res => setAuth(res))
      .catch(err => console.error(err))
  }, [])

  return (
      <DiscordContext.Provider value={{
        auth,
        discordSdk
      }}>
          {children}
      </DiscordContext.Provider>
  )
}



export {
    DiscordContext,
    DiscordContextProvider
};