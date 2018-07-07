const env = require('node-env-file');
env(process.cwd() + '/.env');
const request = require('request');


module.exports = function (controller) {


  controller.hears('/myteams', 'message_received', function (bot, message) {

    bot.reply(message, {
      text: 'I will get your team',
      typing: true,
    },
      () => {
        controller.storage.users.find(
          {
            sectionId: message.user
          },
          (err, users) => {

            if (err || (users && !users.length)) {
              return bot.reply(message, `please login before performing this command!`);
            }

            request.get(
              `${process.env.MATTERMOST_URL}/teams`,
              {
                headers: {
                  'Authorization': `Bearer ${users[0]['token']}`
                }
              },
              (err, resp, body) => {
                if (err) {
                  return bot.reply(message, err.message);
                }
    
                body = JSON.parse(body);
    
                if (resp.statusCode != 200) {
                  return bot.reply(message, body.message);
                } else {
                  let teams = body.map(b => `${b.display_name}</br>`)
                  bot.reply(message, teams.join(''))
                }
              }
            )
          }
        )
      }
    );

  });

}
