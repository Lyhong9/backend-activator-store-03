const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) =>{
  try {
    const authHeader = req.header("Authorization")
    if(!authHeader){
      res.json({
        message: "Access denied. Unauthorized"
      })
    }

    const token = authHeader.split(" ")[1]
    console.log("Incoming Token", token)
    jwt.verify(token,  "lyhong-activator-store-03-secret-key")

    next();
  } catch (error) {
    console.log("ERROR: ", error)
    res.json({
      message: `ERROR ${error}`
    })
  }
}

module.exports = authMiddleware