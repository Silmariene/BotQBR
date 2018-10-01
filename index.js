require('dotenv').config();
const {Client, RichEmbed} = require('discord.js');
const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const commands = {
    '/ping': (msg) => {
        msg.reply('Pong!');
    },
    '/help': (msg) => {
        const embed = new RichEmbed()
            .setTitle('Command list')
            .setColor(0x6666FF)
            .addField('/help', 'Displays this message');
        msg.channel.send(embed);
    },
    '/echo': (msg, ...args) => {
        msg.channel.send(args.join(' '))
    },
    '/example-admin': (msg) => {
        const adminRole = msg.guild.roles.find("name", "admin");
        if (msg.member.roles.has(adminRole.id)) {
            msg.reply("hey, you're an admin!");
        } else {
            msg.reply("hmm... looks like you're not an admin.");
        }
    }
};

client.on('message', msg => {
    const [cmd, ...args] = msg.toString().split(" ");
    if (cmd in commands) {
        commands[cmd](msg, ...args);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);