const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

module.exports = async function ({ config }) {
	const { accessKeyId, secretAccessKey, ses } = config.aws;
	const { from, region } = ses;

	return (handler = async (user) => {
		const { email, name, tempPassword } = user;
		const client = new SESClient({ credentials: { accessKeyId, secretAccessKey }, region });
		const input = userCredentialsTemplate({ from: from.default, to: email, name, password: tempPassword });
		const command = new SendEmailCommand(input);
		await client.send(command);
		return;
	});
};

let userCredentialsTemplate = ({ from, to, name, password }) => ({
	Destination: { ToAddresses: [to] },
	Source: from,
	ReplyToAddresses: [from],
	Message: {
		Subject: { Charset: "UTF-8", Data: `Piping Login Credentials` },
		Body: {
			Html: {
				Charset: "UTF-8",
				Data: `<h3>Hi ${name} !</h3><p>Your credentials are below</p><p>Email: ${to}</b></p><p>Password: <b>${password}</b></p>`,
			},
			Text: { Charset: "UTF-8", Data: `Hi ${name} !Your piping login credentials` },
		},
	},
});
