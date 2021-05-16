const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

//Use express middleware to handle cookies(JWT)
server.express.use(cookieParser());
//TODO Use express middleware to populate current user
//decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    //put the userId oonto the req for future requests access
    req.userId = userId;
  }
  next();
});
//create a middleware that populates user on each request
server.express.use( async (req,res,next) => {
  if(!req.userId) return next();

  const user = await db.query.user(
    {where: {id: req.userId}},
    '{id, name, permissions, email}'
  );
  req.user = user;
  //console.log(req.userId);
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  (deets) => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
  }
);
