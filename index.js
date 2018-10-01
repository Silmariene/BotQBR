require('dotenv').config();
const { Client, RichEmbed } = require('discord.js');
const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const [cmd, ...args] = msg.toString().split(" ");
    if (cmd === '/ping') {
        msg.reply('Pong!');
    }
    if (cmd === '/help') {
        const embed = new RichEmbed()
            .setTitle('Command list')
            .setColor(0x6666FF)
            .addField('/help', 'Displays this message');
        msg.channel.send(embed);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);