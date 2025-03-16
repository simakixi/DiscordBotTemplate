const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello') //コマンドの名前
        .setDescription('hello world'), //コマンドの説明
    async execute(interaction) {
        await interaction.reply('hello'); //ユーザーへの返信
    },
};
