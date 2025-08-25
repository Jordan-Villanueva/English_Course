const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  const { token } = JSON.parse(event.body);

  try {
    const decoded = jwt.decode(token); // solo decode, no verify con secret

    // Temporal: cualquier usuario es autorizado
    if (decoded) {
      return { statusCode: 200, body: JSON.stringify({ authorized: true }) };
    } else {
      return { statusCode: 200, body: JSON.stringify({ authorized: false }) };
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ authorized: false }) };
  }
};
