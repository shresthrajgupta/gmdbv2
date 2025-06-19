import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const Transporter = nodemailer.createTransport({
    service: "Gmail",
    secure: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const mailerGmail = async ({ from, to, subject, text }) => {
    try {
        const mailOptions = { from, to, subject, text };
        const info = await Transporter.sendMail(mailOptions);
    } catch (err) {
        console.log("mailerGmail error\n", err);
    }
};

export default mailerGmail;