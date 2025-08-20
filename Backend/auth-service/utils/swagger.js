const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const version = require('../package.json').version;

const swaggeroptOptions = { 
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth Service API',
            version,
            description: 'API documentation for the Auth Service',
            server: "http://localhost:3001",
        },
    },
    apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggeroptOptions);

function swaggerDocs(app, port) {
    //Swagger page
    app.use('/auth-service-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    //Swagger JSON endpoint
    app.get('/auth-service-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`Swagger docs available at http://localhost:${port}/auth-service-docs`);
}

module.exports = swaggerDocs;