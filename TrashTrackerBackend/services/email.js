// services/emailService.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Uses environment variables for OAuth2 secrets (CRITICAL for scalability)
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_USER } = process.env;

const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' 
);

oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
    }
});

/**
 * Sends the report email in a non-blocking way.
 * This function is called after the main API response is sent to the user.
 */
export const sendReportEmail = async (reportData, imageFileName) => {
    try {
        const mailOptions = {
            from: EMAIL_USER,
            to: reportData.receiverEmail, 
            subject: `New Garbage Report: ID ${reportData.reportId.substring(0, 8)}`,
            text: `A new garbage collection report has been submitted for the location: 
                    Address: ${reportData.address}
                    Coordinates: ${reportData.latitude}, ${reportData.longitude}.
                    
                    Please login to the municipal dashboard to manage this report.`,
            attachments: [
                {
                    filename: imageFileName,
                    path: path.join(process.cwd(), 'uploads', imageFileName)
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Async Email sent successfully to ${reportData.receiverEmail}. Message ID: ${info.messageId}`);

    } catch (error) {
        // Log error but do not throw, as the user already received a success response.
        console.error('FATAL ASYNC EMAIL ERROR (Report saved, but notification failed):', error.message);
    }
};
