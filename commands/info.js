const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const { handleElement, humanTime, caseFix, grabUser } = require("../src/functions.js");


/**
 * @name info
 * @param {Client} client The discord client
 * @param {Message|ChatInputCommandInteraction} element The message or interaction that was created
 * @param {String[]} _args The arguments passed to the command
 * @returns {Promise<void>}
**/
async function run(client, element, args = []){

	const isSlashCommand = (element.user) ? true : false;
	// if(isSlashCommand) await element.deferReply({ ephemeral: true }); // Don't need deferred here

	let user = isSlashCommand ? element.user : element.author;
	let member = (element.guild) ? element.guild.members.cache.get(user.id) : undefined;

	if(args[0]){
		if(isSlashCommand){
			user = await grabUser(client, args[0].id);
			member = element.guild.members.cache.get(user.id);
		} else {
			user = await grabUser(client, args[0]);
			member = element.guild.members.cache.get(user.id);
		}
	}

	const joinDate = humanTime(Date.now() - user.createdTimestamp, "\\Y years, \\M months, \\D days");

	let embedColor = 14487568;
	let displayName = user.username;

	let statusEmbed = { name: "Status:", value: "Unknown", inline: true };
	let playingEmbed = { name: "Playing:", value: "Nothing", inline: true };
	let roleEmbed = { name: "Roles:", value: "N/A", inline: false };

	if(member){
		displayName = member.displayName;
		if(member.presence){

			const title = caseFix(member.presence.status);
			statusEmbed = { name: "Status:", value: title, inline: true };

			if(member.presence.activities.length >= 1){
				for(const activity of member.presence.activities){
					if(activity.type !== 0) continue;

					playingEmbed = { name: "Playing:", value: activity.name, inline: true };
					break;
				}
			}

		}

		if(member.roles){
			const s = function(a, b){ return a.position - b.position; };
			const r = [...member.roles.cache.values()].sort(s).slice(1).reverse().join(", ");
			roleEmbed = { name: "Roles:", value: `\u200b${r}`, inline: false };
		}

		if(member.roles?.highest?.color) embedColor = member.roles.highest.color;
	}

	const embed = new EmbedBuilder()
		.setAuthor({ name: displayName })
		.setThumbnail(user.displayAvatarURL())
		.setTimestamp()
		.setFooter({ text: client.user.tag, iconURL: client.user.displayAvatarURL() });

	const embedFields = [
		{ name: "Username:", value: user.username, inline: true },
		{ name: "Discrim:", value: user.discriminator, inline: true },
		{ name: "Discord ID:", value: user.id, inline: true },
		{ name: "Is bot?", value: caseFix(user.bot), inline: true },
		statusEmbed,
		playingEmbed,
		{ name: "Joined Discord:", value: `${joinDate} ago`, inline: false },
		roleEmbed
	];

	embed.setColor(embedColor);
	embed.addFields(embedFields);
	return await handleElement(element, isSlashCommand, { embeds: [embed], ephemeral: false });
}

const info = {
	name: "info",
	altNames: ["info"],
	description: "Gives information about a user",
	usage: "info {user}",
	enabled: true,
	dmCompatible: true,
	permLevel: 0,
	category: "misc"
};


/**
 * @name slash
 * @param {Client} client The discord client
 * @param {Boolean} [funcs] Whether to return the functions or the data
 * @returns {Object} The slash command data or functions
**/
function slash(client, funcs = false){
	if(!funcs){ // We want to get the slash command data
		return {
			data: new SlashCommandBuilder()
				.setName(info.name)
				.setDescription(info.description)
				.setDMPermission(info.dmCompatible)
				.addUserOption(option => option.setRequired(false).setName("user").setDescription("The user to get information about"))
		};
	}

	return {
		/**
		 * @name execute
		 * @param {ChatInputCommandInteraction} interaction The interaction that was created
		 * @description The function that is called when the slash command is used
		**/
		execute: async function execute(interaction){
			const args = [];

			const user = interaction.options.getUser("user");
			if(user) args.push(user);

			await run(client, interaction, args);
		}
	};
}

module.exports = { run, slash, info };