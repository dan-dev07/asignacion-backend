require('dotenv').config();

const authFacebook = {
  headers: {
    "Content-type": "application/json",
    "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
  }};

module.exports ={
  authFacebook,
};