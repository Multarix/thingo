const colors = require('colors');
const fs = require('fs');
const sql = require("sqlite");
module.exports = async (client) => {

	//	Permission level for commands.
	client.permlevel = (message, data) => {
		let permlvl = 0;

		if(!message.guild || !message.member) permlvl = 0;
		if(message.author.id === client.config.ownerID) return permlvl = 10;
		if(message.author.id === message.guild.owner.id) return permlvl = 5;

		const adminRole = message.guild.roles.get(data.admin);
		if(adminRole && message.member.roles.has(adminRole.id)) return permlvl = 4;

		const modRole = message.guild.roles.get(data.moderator);
		if(modRole && message.member.roles.has(modRole.id)) return permlvl = 3;

		const memRole = message.guild.roles.get(data.member);
		if(memRole && message.member.roles.has(memRole.id)) return permlvl = 1;

		return permlvl;
	};

	//	Client log, semi-useful for keeping track of what is what in the console
	client.log = (msg, title, shardID) => {
		if(!title) title = "Log";
		if(isNaN(shardID)) shardID = "null";

		let str = "";
		const time = require("../modules/time.js")();
		switch (title.toLowerCase()){
		/* eslint-disable indent*/
			case "error": str = `<${colors.red(time.time)}>[${colors.red(`Shard-${shardID}`)}](${colors.red(title)}) ${colors.red(msg)}`; break;
			case "warn": str = `<${colors.yellow(time.time)}>[${colors.yellow(`Shard-${shardID}`)}](${colors.yellow(title)}) ${colors.yellow(msg)}`; break;
			case "notify": str = `<${colors.cyan(time.time)}>[${colors.cyan(`Shard-${shardID}`)}](${colors.cyan(title)}) ${colors.cyan(msg)}`; break;
			case "sql":	str = `<${colors.magenta(time.time)}>[${colors.magenta(`Shard-${shardID}`)}](${colors.magenta(title)}) ${colors.magenta(msg)}`; break;
			default: str = `<${colors.gray(time.time)}>[${colors.gray(`Shard-${shardID}`)}](${colors.gray(title)}) ${colors.gray(msg)}`;	break;
		/* eslint-enable indent */
		}
		fs.appendFileSync("./logs.txt", `\n[${time.exactDate}] (${time.time}) ${msg.replace(/\[\d+m/g, "")}`);		// eslint-disable-line no-control-regex
		const reggie = /\[\[\d+mShard-null\[\d+m\]/;	// eslint-disable-line no-control-regex
		str = str.replace(reggie, "");
		console.log(str);
	};

	client.asshole = require("../modules/asshole.js");

	/*
	MESSAGE CLEAN FUNCTION
	"Clean" removes @everyone pings, as well as tokens, and makes code blocks
	escaped so they're shown more easily. As a bonus it resolves promises
	and stringifies objects!
	This is mostly only used by Eval and Exec commands.
	*/
	client.clean = async (client, text) => {
		if(text && text.constructor.name == "Promise"){
			text = await text;
		}
		if(typeof evaled !== "string"){
			text = require("util").inspect(text, { depth: 0 });
		}
		text = text
			.replace(/`/g, "`" + String.fromCharCode(8203))
			.replace(/@/g, "@" + String.fromCharCode(8203))
			.replace(client.token, "https://i.imgur.com/cGIay9e.png");

		return text;
	};

	// Factorial functions.
	client.factorial = (num) => {
		if(isNaN(num)) return NaN;
		num = parseInt(num);
		let mNum = 1;
		for(let i = 2; i <= num; i++) mNum = mNum * i;
		return mNum;
	};

	/* Non-Critical Misc Functions */

	String.prototype.toProperCase = function() {
		return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
	};

	global.wait = require("util").promisify(setTimeout);

	global.sanity = (text) => {
		text = text
			.replace(/'/g, "''");	// test
		return text;
	};

	/* Custom Globals */

	// Calls process exit, if using something like pm2, the bot should automatically restart.
	global.restartBot = async (restartInfo) => {
		if(!restartInfo) restartInfo = "Automatic Restart";
		client.log(`Perfmorming reboot.. Reason: ${restartInfo}`, "Log");
		await wait(1000).then(w => {
			process.exit();
		});
	};

	// Checks for and fetches a user if it exists.
	global.grabUser = async (userID) => {
		if(!userID) return;
		if(userID.startsWith("<@") && userID.endsWith(">")) userID = userID.slice(2, -1);
		if(userID.startsWith("!")) userID = userID.slice(1);
		await client.users.fetch(userID).catch(e => { return undefined; });
		return client.users.get(userID);
	};

	// Checks for and fetches a channel if it exists.
	global.grabChannel = (channelID) => {
		if(!channelID) return;
		if(channelID.startsWith("<#") && channelID.endsWith(">")) channelID = channelID.slice(2, -1);
		if(!client.channels.get(channelID)) return null;
		return client.channels.get(channelID);
	};

	// Checks for a role and returns it if it exists.
	global.grabRole = (roleID, guild) => {
		if(!roleID) return undefined;
		if(!guild) return undefined;
		if(guild.id) guild = guild.id;
		guild = client.guilds.get(guild);
		if(!guild) return null;
		if(roleID.startsWith("<@&") && roleID.endsWith(">")) roleID = roleID.slice(3, -1);
		if(!guild.roles.get(roleID)) return null;
		return guild.roles.get(roleID);
	};

	global.saReact = async (msg) => {
		if(!msg) return null;
		await msg.reactions.removeAll();
		wait(1000);
		const data = await sql.get(`SELECT * FROM settings WHERE guild = "${msg.guild.id}"`);
		const saData = data.assignRoles;
		const assignArray = saData.split("*");
		assignArray.forEach(x => {
			const emojiID = x.match(/\[(.*?)\]/)[0].replace(/[\][]/g, "");
			let actualEmoji = emojiID;
			if(client.emojis.get(actualEmoji)) actualEmoji = client.emojis.get(actualEmoji);
			msg.react(actualEmoji);
		});
	};

	global.talkedRecently = new Set();

	// I see your unhandled things, and present to you, handled things!

	process.on("uncaughtException", (err) => {
		const time = require("../modules/time.js")();
		const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
		fs.appendFileSync("./logs.txt", `\n[${time.exactDate}] (${time.time}) ${"Uncaught Exception:" + errorMsg.toString().replace(/\[3[7&9]m/g, "")}`);	// eslint-disable-line no-control-regex
		console.error("Uncaught Exception: ", errorMsg);
		restartBot("Uncaught Exception");
	});

	process.on("unhandledRejection", err => {
		const time = require("../modules/time.js")();
		fs.appendFileSync("./logs.txt", `\n[${time.exactDate}] (${time.time}) ${err.toString().replace(/\[3[7&9]m/g, "")}`);	// eslint-disable-line no-control-regex
		console.error("Uncaught Promise Error: ", err);
		restartBot("Unhandled Rejection");
	});
};
