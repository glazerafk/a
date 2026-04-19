const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  PermissionFlagsBits 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// =====================
// SLASH COMMANDS
// =====================
const commands = [
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banir um usuário")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Usuário")
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Motivo")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Dar timeout em um usuário")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Usuário")
        .setRequired(true))
    .addIntegerOption(opt =>
      opt.setName("minutes")
        .setDescription("Minutos")
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Motivo")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsar usuário")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Usuário")
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Motivo")
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
].map(cmd => cmd.toJSON());

// =====================
// REGISTRAR COMANDOS
// =====================
client.once("ready", async () => {
  console.log(`Logado como ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("Slash commands registrados!");
});

// =====================
// EXECUÇÃO DOS COMANDOS
// =====================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 🔨 BAN
  if (commandName === "ban") {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Sem motivo";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "Usuário não encontrado", ephemeral: true });

    await member.ban({ reason });

    return interaction.reply(`🔨 ${user.tag} foi banido. Motivo: ${reason}`);
  }

  // ⛔ TIMEOUT
  if (commandName === "timeout") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") || "Sem motivo";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "Usuário não encontrado", ephemeral: true });

    await member.timeout(minutes * 60 * 1000, reason);

    return interaction.reply(`⛔ ${user.tag} mutado por ${minutes} minutos. Motivo: ${reason}`);
  }

  // 👢 KICK
  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Sem motivo";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "Usuário não encontrado", ephemeral: true });

    await member.kick(reason);

    return interaction.reply(`👢 ${user.tag} foi expulso. Motivo: ${reason}`);
  }
});

// =====================
client.login("MTQ5NTIzMDM5MTc4MTY5MTQyMg.GIgI0N.GLS35wsx3T0lrdUf9pFpoL6ZEuoZo7wKTTvYhI");
