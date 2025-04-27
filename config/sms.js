// config/sms.js
import axios from 'axios';

const sendSMS = async (phone, message) => {
  await axios.post('https://textbelt.com/text', {
    phone,
    message,
    key: process.env.TEXTBELT_KEY,
  });
};

export { sendSMS };
