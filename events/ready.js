const { Client } = require("discord.js");
const deploySlash = require("../modules/deploySlash.js");
/**
 * @name ready
 * @param {Client} client The discord client
 * @description Emitted when the client becomes ready to start working.
 * @returns {Promise<void>}
**/
async function run(client){

	await deploySlash(client);

	client.output("misc", `Accessing a total of '${client.guilds.cache.size}' server(s) With a total of '${client.users.cache.size}' users`);

	const presence = {
		status: "online",
		activities: [{
			// type: "WATCHING",
			name: `${client.guilds.cache.size} server${(client.guilds.cache.size > 1) ? "s" : ""} || ${client.config.prefix}help`
		}]
	};

	client.user.setPresence(presence);
}

const info = {
	name: "ready",
	description: "Emitted when the client becomes ready to start working.",
	enabled: true
};

module.exports = { run, info };