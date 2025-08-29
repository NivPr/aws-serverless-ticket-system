const { 
  calculateSecretHash, 
  signUp, 
  signIn, 
  confirmSignUp 
} = require("./services/authServices");


exports.handler = async (event) => {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.rawPath;
    const body = event.body ? JSON.parse(event.body) : {};

    console.log("DEBUG:", { httpMethod, path });

  
    switch (true) {
      case httpMethod === "POST" && path.endsWith("/auth/signUp"):
        {
          const { username, password, email } = body;
          if (!username || !password || !email) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username, password or email" }),
            };
          }
          const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);
          const result = await signUp(username, password, email, secretHash);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "SignUp successful", data: result }),
          };
        }

      case httpMethod === "POST" && path.endsWith("/auth/login"):
        {
          const { username, password } = body;
          if (!username || !password) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username or password" }),
            };
          }
          const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);
          const result = await signIn(username, password, secretHash);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "SignIn successful", data: result.AuthenticationResult }),
          };
        }

      case httpMethod === "POST" && path.endsWith("/auth/verifyCode"):
        {
          const { username, confirmationCode } = body;
          if (!username || !confirmationCode) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username or confirmationCode" }),
            };
          }
          const result = await confirmSignUp(username, confirmationCode);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "ConfirmSignUp successful", data: result }),
          };
        }

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Route not found" }),
        };
    }
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message || "Unknown error",
      }),
    };
  }
};
