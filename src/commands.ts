import { goals } from 'mineflayer-pathfinder';
import { callGpt } from './gpt';

const sendSplitMessage = (bot: any, message: string) => {
    const maxLength = 100;
    const messages: any[] = [];

    for (let i = 0; i < message.length; i += maxLength) {
        messages.push(message.slice(i, i + maxLength));
    }

    let index = 0;
    const sendNext = () => {
        if (index < messages.length) {
            bot.chat(messages[index]);
            index++;
            setTimeout(sendNext, 3000);
        }
    };
    sendNext();
};

const handleChatCommand = async (bot: any, options: any, username: string, message: string) => {
    if ((username == bot.username) || !message.startsWith(options.prefix)) return;

    const args = message.slice(options.prefix.length).trim().split(' ');
    const argsShift = args.shift();
    const command = argsShift !== undefined ? argsShift.toLowerCase() : '';

    if (command == 'say') {
        bot.chat(args.join(' '));
    } else if (command == 'comehere') {
        const target = bot.players[username] ? bot.players[username].entity : null;
        if (!target) {
            bot.chat('I can not see you, i do not know where are you');
            return;
        }
        const player = target.position;
        bot.pathfinder.setGoal(new goals.GoalNear(player.x, player.y, player.z, 1));
    } else if (command == 'goto') {
        const x = parseInt(args[0]);
        const y = parseInt(args[1]);
        const z = parseInt(args[2]);
        bot.pathfinder.setGoal(new goals.GoalNear(x, y, z, 1));
    } else if (command == 'go') {
        const x = parseInt(args[0]);
        const z = parseInt(args[1]);
        bot.pathfinder.setGoal(new goals.GoalNearXZ(x, z, 1));
    } else if (command === 'pvp') {
        const player = bot.players[username];
        if (!player) {
            bot.chat('I can not see you.');
            return;
        }
        bot.pvp.attack(player.entity);
    } else if (command === 'stop') {
        bot.pvp.stop();
    } else if (command === 'gpt') {
        if (args.length === 0) {
            bot.chat('Please provide a question for GPT');
            return;
        }
        bot.chat('Sending question to GPT');
        const gptResponse = await callGpt('Answer user questions.', options, args.join(' '), username);
        if (!gptResponse.error) {
            sendSplitMessage(bot, gptResponse.message ? gptResponse.message : '');
        } else {
            bot.chat(gptResponse.message);
        }
    }
};

export { handleChatCommand };