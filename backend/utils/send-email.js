const { EmailClient, KnownEmailSendStatus } = require("@azure/communication-email");
require("dotenv").config();

function getEmailClient() {
    const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];

    if (!connectionString) {
        throw new Error('COMMUNICATION_SERVICES_CONNECTION_STRING is not configured');
    }

    return new EmailClient(connectionString);
}

async function sendEmail(booking) {
    const POLLER_WAIT_TIME = 10
    try {
        const emailClient = getEmailClient();
        const message = {
            senderAddress: "<donotreply@1bfbe8a3-ed15-4f02-b234-22c449805775.azurecomm.net>",
            content: {
                subject: `Your booking request ( id: ${booking._id} )`,
                // plainText: "This email message is sent from Azure Communication Services Email using the JavaScript SDK.",
                html: buildEmailContent(booking)
            },
            recipients: {
                to: [
                    {
                        address: `${booking.username}@htc.edu.hk`,
                        displayName: booking.username,
                    },
                ],
            },
        };

        const poller = await emailClient.beginSend(message);

        if (!poller.getOperationState().isStarted) {
            throw "Poller was not started."
        }

        let timeElapsed = 0;
        while (!poller.isDone()) {
            poller.poll();
            console.log("Email send polling in progress");

            await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
            timeElapsed += 10;

            if (timeElapsed > 18 * POLLER_WAIT_TIME) {
                throw "Polling timed out.";
            }
        }

        if (poller.getResult().status === KnownEmailSendStatus.Succeeded) {
            console.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
        }
        else {
            throw poller.getResult().error;
        }
    } catch (e) {
        console.log(e);
    }
}

function buildValueContent(key, value, booking) {
    if (key === "startTime" || key === "endTime" || key === "updatedAt" || key === "fd" || key === "filename") {
        return "";
    }
    if (key === "date") {
        return `${new Date(value).toLocaleDateString("en-CA")}, ${booking.startTime} - ${booking.endTime}`;
    }
    if (key === "createdAt") {
        return `${new Date(value).toLocaleString("en-CA")}`;
    }
    return value;
}

function buildEmailContent(context) {

    const tableContent = Object.entries(context).map(([key, value]) => {
        if (key === "startTime" || key === "endTime" || key === "updatedAt" || key === "fd" || key === "filename") {
            return "";
        }
        return `<tr>
                    <td>${key}</td>
                    <td>${buildValueContent(key, value, context)}</td>
                </tr>`;
    }).join("");

    return `<!DOCTYPE html>
<html>

<head>
	<style>
		table {
			border-collapse: collapse;
			width: 100%;
		}
		th,
		td {
			padding: 8px;
			text-align: left;
			border-bottom: 1px solid #ddd;
		}
	</style>
</head>

<body>
	<p>
		Dear ${context.username},
			<br><br>
			Please note that the following request has been <strong>
				${context.status}
			</strong>.
	</p>
	<br>
	<table>
		${tableContent}
	</table>

	<p>
		Thanks and regards,<br>
		HTC Room Booking System.
	</p>
</body>

</html>`
}

module.exports = { sendEmail };