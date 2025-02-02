import { createBot } from 'mineflayer'
import { pathfinder, Movements } from 'mineflayer-pathfinder';
import { plugin as movement } from 'mineflayer-movement';
import { loader as autoeat } from 'mineflayer-auto-eat';
import { plugin as pvp } from 'mineflayer-pvp';
import { handleChatCommand } from './commands';
import 'dotenv/config';

const bot = createBot({
    host: (process.env.HOST !== undefined) ? process.env.HOST : 'localhost',
    port: (process.env.PORT !== undefined) ? parseInt(process.env.PORT) : 25565,
    username: (process.env.USERNAME !== undefined) ? process.env.USERNAME : 'bot',
    auth: (process.env.AUTH !== undefined && ['mojang', 'microsoft', 'offline'].includes(process.env.AUTH)) ? (process.env.AUTH as 'mojang' | 'microsoft' | 'offline') : 'offline',
    version: (process.env.VERSION !== undefined) ? process.env.VERSION : '1.21'
});
const options = {
    joinMessage: (process.env.JOINMESSAGE !== undefined) ? process.env.JOINMESSAGE : 'Hello!',
    prefix: (process.env.PREFIX !== undefined) ? process.env.PREFIX : '!',
    googleApi: ((process.env.GOOGLEAPI !== undefined) && (process.env.GOOGLEAPI === 'true')) ? true : false,
    url: (process.env.URL !== undefined) ? process.env.URL : 'https://api.openai.com/v1/chat/completions',
    model: (process.env.MODEL !== undefined) ? process.env.MODEL : 'gpt-4o-mini',
    apiKey: (process.env.APIKEY !== undefined) ? process.env.APIKEY : '',
    historyFile: (process.env.HISTORYFILE !== undefined) ? process.env.HISTORYFILE : 'history.yml'
}

bot.loadPlugin(pathfinder);
bot.loadPlugin(movement);
bot.loadPlugin(autoeat);
bot.loadPlugin(pvp);

bot.once('login', () => {
    const { Default } = bot.movement.goals;
    bot.movement.setGoal(Default);
    bot.setControlState("forward", true);
    bot.setControlState("sprint", true);
    bot.setControlState("jump", true);
})

bot.once('spawn', () => {
    const defaultMove = new Movements(bot);

    defaultMove.scafoldingBlocks.push(bot.registry.itemsByName['dirt'].id)
    bot.pathfinder.setMovements(defaultMove);

    bot.chat(options.joinMessage);

    bot.on('physicsTick', () => {
        const entity = bot.nearestEntity((entity) => entity.type === 'player');
        if (entity) {
            bot.movement.heuristic.get('proximity').target(entity.position);
            const yaw = bot.movement.getYaw(240, 15, 1);
            bot.movement.steer(yaw);
        }
    })
    console.log('Bot started');
});

bot.on('chat', (username, message) => {
    handleChatCommand(bot, options, username, message);
});

bot.on(('autoeat_started' as any), (item: any, offhand: any) => {
    console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
});
bot.on(('autoeat_finished' as any), (item: any, offhand: any) => {
    console.log(`Finished eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
});

bot.on('kicked', console.log);
bot.on('error', console.log);