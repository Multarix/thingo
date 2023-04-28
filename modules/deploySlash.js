const { Client, REST, Routes } = require("discord.js");

/**
 * @name deploySlash
 * @param {Client} client The discord client
 * @description Deploys slash commands to all guilds
**/
async function deploySlash(client){

	// Set up slash commands
	const rest = new REST().setToken(client.config.token);
	client.output("misc", "Deploying slash commands...");

	const slashCommands = [];
	for(const command of client.slashCommands) slashCommands.push(command.slash.data.toJSON());

	for(let guild of client.guilds.cache){
		guild = guild[1];
		if(guild.partial) await guild.fetch().catch(e => { return; });
		try {
			await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: slashCommands });
		} catch {
			client.output("error", `Failed to deploy slash commands to guild '${guild.id}'`);
		}
	}
}

module.exports = deploySlash;