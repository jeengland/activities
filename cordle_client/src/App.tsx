import { useContext, useEffect, useState } from "react";
import "./App.css";

import { DiscordContext } from './hooks/discordProvider';

type Guild = {
  id: string;
}

function App() {
  const { auth, discordSdk } = useContext(DiscordContext);

  const [activityChannelName, setActivityChannelName] = useState<string>("Unknown")
  const [guildImgSrc, setGuildImgSrc] = useState<string>("")

  useEffect(() => {
    if (discordSdk.channelId !== null && discordSdk.guildId !== null) {
      discordSdk.commands.getChannel({ channel_id: discordSdk.channelId })
        .then((channel) => {
          if (channel.name) {
            setActivityChannelName(channel.name)
          }
        })
    }
  }, [auth])

  useEffect(() => {
    if (auth) {
      fetch(`https://discord.com/api/v10/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        }
      })
      .then(res => res.json())
      .then(guilds => {
        const currentGuild = guilds.find((g: Guild) => g.id === discordSdk.guildId);

        setGuildImgSrc(`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`)
      })
    }
  }, [auth])


  return (
    <>
      <h1>Cordle</h1>
      <p>Channel name: {activityChannelName}</p>
      {guildImgSrc && <img height="128px" width="128px" style={{ borderRadius: "50%" }} src={guildImgSrc}/>}
    </>
  );
}

export default App;
