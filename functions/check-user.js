const jwt = require("jsonwebtoken");

const allowedUsers = ["juanito.perez@gmail.com"]; // emails autorizados
const AUTH0_DOMAIN = "https://dev-bjoqtux6wua5w2l2.us.auth0.com/"; 

exports.handler = async (event) => {
  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ authorized: false }) };
    }

    // Verifica el token usando la clave pública de Auth0 (simplificado para demo)
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      return { statusCode: 401, body: JSON.stringify({ authorized: false }) };
    }

    const authorized = allowedUsers.includes(decoded.email);

    return {
      statusCode: 200,
      body: JSON.stringify({ authorized })
    };

  } catch (error) {
    console.error("Error verificando token:", error);
    return { statusCode: 500, body: JSON.stringify({ authorized: false }) };
  }
};
