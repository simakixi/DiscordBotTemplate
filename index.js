//Discord.jsライブラリからDiscordBotを操作するための主要なクラスや機能をインポート
const { Client, GatewayIntentBits, REST, Routes, ChannelType, EmbedBuilder } = require('discord.js');
//Node.js標準モジュールfsをインポート
const fs = require('fs');
//Node.jsのpathをインポート
const path = require('path');

//DiscordクライアントからBotを作成
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

//Botがコマンドを管理するためのMap(キーと値のペア)を作成
client.commands = new Map();

//コマンドを保存するための配列
const commands = [];
//./Commandディレクトリ内の全ての.jsファイルを読み込み、それをcommandFilesに格納
const commandFiles = fs.readdirSync('./Command').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    //ファイルをモジュールとして読み込む
    const command = require(`./Command/${file}`);
    //コマンドの名前をキー、コマンドオブジェクトを値としてclient.commandsに格納
    client.commands.set(command.data.name, command);
    //コマンドデータをcommand配列に追加
    commands.push(command.data);
}

//Botが準備完了した際に一度だけ実行するイベントリスナーを設定
client.once('ready', async () => {
    //DiscordのRESTAPIを利用するためのインスタンスを作成してトークンを設定
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  
    try {
        await rest.put( //applicationCommandsエンドポイントを使用してコマンドを登録
            Routes.applicationCommands(process.env.clientId),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }
});

//ユーザーのコマンドやインタラクションを受け取るイベントリスナーを設定
client.on('interactionCreate', async interaction => {
    //インタラクションがコマンドではない場合処理を終了
    if (!interaction.isCommand()) return;
    //ユーザーが入力したコマンド名から対応するコマンドを取得する
    const command = client.commands.get(interaction.commandName);
    //コマンドが見つからない場合処理を終了
    if (!command) return;

    try {   //対応するコマンドのexecute関数を実行
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'エラーが発生しました', ephemeral: true });
    }
});
//トークンを環境変数から取得しDiscordBotとしてログイン
client.login(process.env.TOKEN);