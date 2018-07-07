const env = require('node-env-file');
const request = require('request');


env(`${process.cwd()}/.env`);

module.exports = (controller) => {

  controller.hears('/login', 'message_received', (bot, message) => {

    const txt = message.text.split(' ')[1];
    const [
      login_id,
      password
    ] = txt.split('/');

    bot.reply(message, {
      text: 'waiting',
      typing: true,
    });

    request(
      `${process.env.MATTERMOST_URL}/users/login`,
      {
        method: 'post',
        body: JSON.stringify({
          login_id,
          password
        })
      },
      (err, resp, body) => {

        if (err) {
          return bot.reply(message, err.message);
        }

        body = JSON.parse(body);

        if (resp.statusCode != 200) {
          return bot.reply(message, body.message);
        } else {

          controller.storage.users.save(
            { ...body, token: resp.headers.token, sectionId: message.user },
            (err, resp) => {
              if (err) {
                console.error('create user error',err.message)
                return;
              }

              bot.reply(message, {
                text: `Hello ${body.nickname}`
              })
            }
          );
        }
      }
    )


  })



}