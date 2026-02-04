const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Bullet Note API documentation',        
    version: '1.0.0',                   
    description: 'Bullet Note backend interface documentation' // descripition
  },
  servers: [
    {
      url: 'http://localhost:5000',       
      description: 'development server'        
    }
  ],
  components: {
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'success' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'failure' }
        }
      }
    },
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'note_token' 
      }
    }
  }
};

const outputFile = './swagger_output.json'; 
const endpointsFiles = [
  './routes/userRoutes.js',  
  './routes/noteRoutes.js'   
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger 配置文件生成成功！');
});