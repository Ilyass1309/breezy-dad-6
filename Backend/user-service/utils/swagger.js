const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const version = require('../package.json').version;

const swaggeroptOptions = { 
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'User Service API',
            version,
            description: 'API documentation for the User Service',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['../routes/*.js', '../models/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggeroptOptions);

function swaggerDocs(app, port) {
    //Swagger page
    app.use('/user-service-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    //Swagger JSON endpoint
    app.get('/user-service-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
}

module.exports = swaggerDocs;