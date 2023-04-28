const { Client, Interaction } = require("discord.js");

/**
 * @name interactionCreate
 * @param {Client} client The discord client
 * @param {Interaction} interaction The interaction that was created
 * @description Emitted whenever an interaction is created.
 * @returns {Promise<void>}
**/
async function run(client, interaction){

	if(!interaction.isChatInputCommand()) return;
	// if(!interaction.channel.permissionsFor(interaction.guild.members.me).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel])) return;

	const command = client.commands.get(interaction.commandName);
	if(!command){
		interaction.reply({ content: "Oops! That command doesn't seem to exist!\nPlease report the error here: https://github.com/Multarix/Guildbot/issues", ephemeral: true }).catch(e => { return; });
		return client.output("error", `Command ${interaction.commandName} not found!`);
	}

	// Check if the command is enabled
	if(!command.info.enabled) return interaction.reply({ content: "Oops! That command is currently disabled!", ephemeral: true }).catch(e => { return; });

	// Check if the user has permission to run the command
	const userPermLevel = client.permLevel(interaction.user, interaction.channel);
	if(command.info.permLevel > userPermLevel) return interaction.reply({ content: "Oops! You don't have permission to use that command!", ephemeral: true }).catch(e => { return; });

	try {
		await command.slash(client, true).execute(interaction);
	} catch (e){
		client.output("error", e);
		let followUp = false;
		if(interaction.replied || interaction.deferred){
			await interaction.followUp({ content: "An error occurred while executing this command!", ephemeral: true }).catch(e => { return; });
			followUp = true;
		}

		if(!followUp) await interaction.reply({ content: "An error occurred while executing this command!", ephemeral: true }).catch(e => { return; });
	}
}

const info = {
	name: "interactionCreate",
	description: "Emitted whenever an interaction is created.",
	enabled: true
};

module.exports = { run, info };