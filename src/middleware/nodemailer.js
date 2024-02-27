const nodemailer = require('nodemailer');

const shatEmail = 'shatapp2024@gmail.com';
const shatPassword = 'agzy qvdl bzle dgvp';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: shatEmail,
    pass: shatPassword,
  },
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

function mailerChecker(username, email, callback) {
  const verificationCode = generateCode();

  const mailOptions = {
    from: shatEmail,
    to: email,
    subject: 'Shat - Verification Code',
    text: `Hello ${username}, welcome to Shat! Please enter the following code in the verification input back on Shat: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      callback(error, null);
    } else {
      callback(null, verificationCode);
    }
  });
}

module.exports = mailerChecker;
