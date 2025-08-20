const authController = require("../controllers/auth.controller");

module.exports = function(app) {
  /**
 * @swagger
 * /register:
 *  post:
 *   tags:
 *    - Auth
 *   summary: Register a new user
 *   requestBody:
 *    required: true
 *    content: 
 *     application/json:
 *      schema:
 *       $ref : '#/components/schemas/AuthUser'
 *    responses:
 *     201:
 *      description: User registered successfully
 *     400:
 *      description: Bad request, missing required fields
 *    
 */
  app.post("/register", authController.register);

  /**
 * @swagger
 * /login:
 *  post:
 *   tags:
 *    - Auth
 *   summary: Login an existing user
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *       type: object
 *       properties:
 *        username:
 *         type: string
 *         example: jhon_doe
 *        password:
 *         type: string
 *         example: mysecretpassword
 *       required:
 *        - username
 *        - password
 *      
 *   responses: 
 *    200:
 *     description: User logged in successfully
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         token:
 *          type: string
 *
 *    401:
 *     description: Unauthorized, invalid credentials
 */
  app.post("/login", authController.login);
  app.get("/auth/verify", authController.verifyToken);
  app.post("/auth/refresh-token", authController.refreshToken);
  app.post("/auth/logout", authController.logout);
};