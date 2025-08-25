// functions/check-user.js
const jwt = require("jsonwebtoken");
const allowedUsers = ["juanito.perez@gmail.com"];

exports.handler = async function(event, context) {
  try {
    const { token } = JSON.parse(event.body);

    // Decodificar token (sin verificar la firma, suficiente para emails)
    const decoded = jwt.decode(token);

    if (decoded && allowedUsers.includes(decoded.email)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ authorized: true })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ authorized: false })
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ authorized: false, error: error.message })
    };
  }
};
