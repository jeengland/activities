import { DiscordSDK } from '@discord/embedded-app-sdk';

import './style.css'
import rocketLogo from '/rocket.png'

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID)


// globals
let auth;

setupDiscordSdk().then(() => {
  console.log("Discord SDK is authenticated");

  appendVoiceChannelName();
  appendGuildAvatar();
})

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

  auth = await discordSdk.commands.authenticate({
    access_token,
  });

  if (auth === null) {
    throw new Error("Authenticate command failed");
  }
}

async function appendVoiceChannelName() {
  const app = document.querySelector('#app');

  let activityChannelName = "Unknown";

  if (discordSdk.channelId !== null && discordSdk.guildId !== null) {
    const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
    if (channel.name !== null) {
      activityChannelName = channel.name;
    }
  }

  const textTagString = `Activity Channel: ${activityChannelName}`;
  const textTag = document.createElement('p');

  textTag.textContent = textTagString;
  app.appendChild(textTag);
}

async function appendGuildAvatar() {
  const app = document.querySelector("#app");

  const guilds = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      'Content-Type': 'application/json',
    }
  }).then(response => response.json());

  const currentGuild = guilds.find(g => g.id === discordSdk.guildId);

  if (currentGuild !== null) {
    const guildImg = document.createElement('img');
    guildImg.setAttribute(
      'src',
      `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`
    );
    guildImg.setAttribute('width', '128px');
    guildImg.setAttribute('height', '128px');
    guildImg.setAttribute('style', 'border-radius: 50%');
    
    app.appendChild(guildImg);
  }
}


document.querySelector('#app').innerHTML = `
  <div>
    <img src="${rocketLogo}" class="logo" alt="Discord" />
    <h1>Hello, World!</h1>
  </div>
`;