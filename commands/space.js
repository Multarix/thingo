const Discord = require('discord.js');
const nasa = require("apod-nasa");
exports.run = async (client, message, args, level) => {

	const apod = await nasa();
	if(!apod) return message.channel.send("Uh oh, it seems that something broke \:("); // eslint-disable-line no-useless-escape

	if(message.channel.memberPermissions(message.guild.me).has("EMBED_LINKS")){
		const embed = new Discord.RichEmbed()
			.setAuthor(apod.title)
			.setImage(apod.image)
			.setTimestamp()
			.setFooter(`Astronomy Picture of the Day`, "https://i.imgur.com/CO4a8X6.png");

		return message.channel.send({ embed });
	}
	return message.channel.send(apod.image);
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ["apod", "nasa", "astronomy"],
	permLevel: 0,
};

exports.help = {
	name: "space",
	category: "Misc",
	description: "Posts the Astronomy picture of the day.",
	usage: "..",
};
