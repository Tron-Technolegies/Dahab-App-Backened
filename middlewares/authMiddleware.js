import { UnauthenticatedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/jwtUtils.js";

export const authenticateUser = async (req, res, next) => {
  //middleware for decoding the token, middleware for checking if the user has valid token or not

  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; //for flutter
  // changed this route
  // const { token } = req.cookies; //for web-apps
  if (!token) throw new UnauthenticatedError("unable to access");

  try {
    const decoded = verifyJWT(token);

    const { userId } = decoded;

    req.user = { userId: userId };
    next();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("Invalid Authorization");
  }
};
