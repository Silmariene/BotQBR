require('dotenv').config();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Client, RichEmbed} = require('discord.js');
const client = new Client();
const express = require('express');
const app = express();

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({
    applications: [],
    announce: "",
}).write();

let applyChannel = null;
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.guilds.forEach(guild => {
        let channel = guild.channels.find(ch => ch.name === 'test-acelis');
        if (channel) applyChannel = channel;
    });
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
        const adminRole = msg.guild.roles.find(r => r.name === "admin");
        if (msg.member.roles.has(adminRole.id)) {
            msg.reply("hey, you're an admin!");
        } else {
            msg.reply("hmm... looks like you're not an admin.");
        }
    },
    '/announce': (msg, ...args) => {
        const adminRole = msg.guild.roles.find(r => r.name === "admin");
        if (args.length === 0) {
            const embed = new RichEmbed()
                .setTitle('Announce')
                .setDescription(db.get('announce').value());
            msg.channel.send(embed);
        } else if (args.length > 0 && msg.member.roles.has(adminRole.id)) {
            db.set('announce', args.join(' ')).write();
            msg.channel.send("Announce updated.");
        }
    },
    '/apply': (msg) => {
        // check if the user already exists in database
        let [user] = db.get('applications').filter({id: msg.author.id}).take(1).value();

        if (!user) {
            user = {
                id: msg.author.id,
                tag: msg.author.tag,
                token: [...Array(32)].map(i => (~~(Math.random() * 36)).toString(36)).join(''),
                status: 'empty',
                applyDate: Date.now(),
            };
            db.get('applications').push(user).write();
        }

        msg.member.createDM().then(channel => {
            channel.send(`WIP: Here's your application form: ${process.env.PUBLIC_ENDPOINT}/apply?token=${user.token}`)
        })
    }
};

client.on('message', msg => {
    if (msg.author.bot)
        return; // We don't deal with other bots
    if (msg.channel.type !== 'text') {
        msg.reply(`I don't support channels of type _${msg.channel.type}_.`);
        return; // direct messages and the like aren't supported (yet)
    }
    const [cmd, ...args] = msg.toString().split(" ");
    if (cmd in commands) {
        commands[cmd](msg, ...args);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Website applications
app.get('/apply', function (req, res) {
    const [application] = db.get('applications').filter({token: req.query.token}).take(1).value();
    if (!req.query.token || !application) {
        res.status(404);
        return res.send("Application not found");
    }
    res.send(`Hey, are you user ${application.tag}? Click <a href="/apply/validate?token=${application.token}">here</a> to submit your application.`);
});

app.get('/apply/validate', function (req, res) {
    const applicationEntry = db.get('applications').filter({token: req.query.token}).take(1);
    const [application] = applicationEntry.value();
    if (!req.query.token || !application) {
        res.status(404);
        return res.send("Application not found");
    }

    if (application.status === 'empty') {
        // first time the form is submitted, we handle it
        applicationEntry.last().assign({
            status: 'processing',
            processingDate: Date.now(),
        }).write();
        applyChannel.send(`Somebody just applied! The name's ${application.tag}. Now... vote.`);
        return res.send("Thanks for applying! We'll get in touch with you soon.");
    }
    if (application.status === 'processing') {
        // we already are processing this application
        return res.send("We already are processing this application. We'll get in touch with you soon.");
    }
    if (application.status === 'accepted') {
        // we already accepted this application
        return res.send("Congratz ;)");
    }
    if (application.status === 'accepted') {
        // we already accepted this application
        return res.send("Sorry, but your application have been refused.");
    }

    return res.send("Unknown status. This should not happen.");
});

app.listen(3000);
console.log(`Server running on port 3000`);