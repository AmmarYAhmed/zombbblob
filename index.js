const { Client, GatewayIntentBits, Partials } = require('discord.js');
const WOK = require('wokcommands');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

require('dotenv').config();

const topTen = [];
let topTenUpdated = null;

async function updateTopTen() {
	if (topTenUpdated != null && Date.now() - topTenUpdated < 60 * 1000) {
		return; // no
	}
	await fetch(
		'https://mee6.xyz/api/plugins/levels/leaderboard/734492640216744017',
		{
			headers: {
				accept: 'application/json',
			},
			body: null,
			method: 'GET',
		},
	)
		.then((response) => response.json())
		.then((data) => {
			for (let i = 0; i < 10; ++i) {
				topTen[i] = data['players'][i]['id'];
			}
		});
	topTenUpdated = Date.now();
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel],
});

client.on('ready', () => {
	console.log('zombbblob has awoken');
	new WOK(client, {
		testServers: ['734492640216744017'],
		commandsDir: path.join(__dirname, 'commands'),
		disabledDefaultCommands: [
			'channelcommand',
			'customcommand',
			'delcustomcommand',
			'prefix',
			'requiredpermissions',
			'requiredroles',
			'togglecommand',
		],
		botOwners: ['269910487133716480', 	//toafu
					'730205193408479242', 	//ajzhou
				],
	})
		.setDefaultPrefix('z!');
	process.on('unhandledRejection', (error) => {
		console.error('Unhandled promise rejection:', error);
	});
	client.user.setPresence({
		activities: [{ name: 'Dawn of the Outbbbreak' }],
		status: 'online',
	});
});

client.on('messageCreate', async (message) => {
	let infectedWord = fs.readFileSync('infectedWord.txt', 'utf8');
	const words = message.content.toLowerCase().split(' ');
	if (message.content.startsWith('!rank')) { //if person types !rank
		const filter = (m) => m.author.id.toString() === '159985870458322944';
		const collector = message.channel.createMessageCollector({
			filter,
			time: 5000,
			max: 1,
		});
		collector.on('collect', async (m) => {
			//collected following MEE6 message
			let rankQuery = message.author.id.toString();
			if (words.length > 1) {
				//assumes user is querying another user
				if (words[1].match(/\d+/)) {
					rankQuery = words[1].match(/\d+/)[0];
				}
			}
			await updateTopTen();
			if (rankQuery === topTen[0]) { //per request of slime
				await m.react('<:burgerKingBlobL:1026644796703510599>');
				await m.react('🤡');
				await m.react('💀');
				await m.react('👎');
			} else if (topTen.includes(rankQuery)) { //if user is in top 10
				m.react('<:blobL:1023692287185801376>'); //react blobL
			} else {
				m.react('<:blobW:1023691935552118945>'); //react blobW
			}
		});
	} //if !rank
	else {
		if (message.content.toLowerCase().search(infectedWord) != -1) {
			//user says infected word
			if (!message.member.roles.cache.some((role) => role.name === 'zombbblob')) {
				//user meets infection criteria
				message.react('<:zombbblob:1026136422572372170>'); //react with :zombbblob:
				message.member.roles.add('1024787443951611974'); //add zombbblob role
				client.channels.cache.get('1024801253257130005')
				.send(`<@${message.author.id}> was zombified <:zombbblob:1026136422572372170>\n${message.author.username} was infected by \`${infectedWord}\`\n${message.url}`);
			} //if user is not zombbblob'd
		} //if infection trigger
	} // if ~!rank
});

client.login(process.env.TOKEN);
