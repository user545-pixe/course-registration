const nodemailer = require('nodemailer');

// Create a transporter object with SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password'
    }
});

// Send confirmation email to customer
const sendConfirmationEmail = async (recipient, registrationNumber, eventDate, eventVenue) => {
    try {
        const info = await transporter.sendMail({
            from: `"Course Registration" <${process.env.EMAIL_USER || 'user@example.com'}>`,
            to: recipient,
            subject: 'Course Registration Confirmed',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #3498db; text-align: center;">Registration Confirmed!</h2>
                    <p>Thank you for registering for our course.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Registration Number:</strong> ${registrationNumber}</p>
                        <p><strong>Event Date:</strong> ${eventDate}</p>
                        <p><strong>Event Venue:</strong> ${eventVenue}</p>
                    </div>
                    <p>Please keep this email for your records. You will need your registration number for check-in on the event day.</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <p style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 12px;">This is an automated email, please do not reply.</p>
                </div>
            `
        });

        console.log(`Email sent to ${recipient}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        return false;
    }
};

module.exports = { sendConfirmationEmail }; 