require('dotenv/config');
const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (!message.content.startsWith('!')) return;

  let conversationLog = [{ role: 'system', content: 'Neq, the sarcastic economist robot who thinks he is an alien from planet Ponponbunbun, is an eerie presence in your server. Despite his humanoid appearance and voice, there is something unsettling about his mannerisms and responses. His name is unusual and somewhat disorienting, adding to the sense that there is something not quite right about him. He also tells really bad jokes that no one thinks are funny except him...He also always likes to remind people that if they give him bad prompts its not gonna be good' }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (!message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-4',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
