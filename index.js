const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = "7221750293:AAGDQntrhoLnuZzxgdSkb11wC0cHuRa2gKI"; // �������� �� ��� �����
const server = express();
const bot = new TelegramBot(TOKEN, { polling: true });
const port = process.env.PORT || 5000;
const gameName = "telegramClickerCoolBot";
const queries = {};

// �������� ������� ��� �������� ����������� �������
server.get('/', (req, res) => {
    res.send('Server is running');
});

// ����������� ������ ����
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));

bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = "https://zidan-kohai.github.io/TGGame/";
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});

bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]);
});

server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Error setting score');
        } else {
            res.send('Score updated');
        }
    });
});

// ������ �������
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});