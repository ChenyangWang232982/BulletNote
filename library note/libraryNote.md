# Core framework and basic tools

## Express

A Node.js backend web development framework for quickly building HTTP servers, handling routing, middleware management, and other core functionalities.

```js
// backend/app.js
const express = require('express');
const app = express();
app.use(express.json());                     
app.use(express.urlencoded({ extended: true })); 
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.listen(PORT, () => {
  console.log(`🚀 running on http://localhost:${PORT}`);
});

// backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
module.exports = router;
```

## dotenv

```js
// backend/app.js
require('dotenv').config();

// backend/config/config.js
require('dotenv').config();
module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    host: process.env.MYSQL_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.MYSQL_PORT || 3306,
  },
};

// backend/middleware/auth.middleware.js
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
```

## CORS & Cookie Handling

- cors
  - **Function**: Handle Cross-Origin Resource Sharing (CORS) to allow frontend cross-domain requests.

```js
// backend/app.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Skip-Alert']
}));
//X-Skip-Alert used for autoLogin
```

- cookie-parser
  - **Function**: Parse cookies from HTTP requests and attach to `req.cookies`.

```js
// backend/app.js
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// backend/controllers/userController.js
res.cookie(
    'note_token',
    token,
    {
        httpOnly: true,
        maxAge: JWT_EXPIRES_IN * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    }
);

// backend/middleware/auth.middleware.js
const token = req.cookies.note_token;
```

## sequelize

- **Function**: ORM tool for Node.js, simplifying MySQL operations with model definition, associations, and queries.

```js
// backend/config/db.js
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
    process.env.MYSQL_DB_NAME,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        port: process.env.MYSQL_PORT || 3306,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connect successfully');
        await sequelize.sync({ alter: true });
        console.log('Synchronization completed')
    } catch (error) {
        console.error('MySQL connection failed: ', error.message);
        process.exit(1);
    }
};
module.exports={ sequelize, connectDB}

// backend/models/Note.js
const { DataTypes} = require('sequelize');
const { sequelize } = require('../config/db');
const Note = sequelize.define('Note', {
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue:'default'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'notes',
    timestamps: true
});
module.exports = Note;

// backend/models/index.js
User.hasMany(Note, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    sourceKey: 'id'
})
Note.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author',
    targetKey: 'id'
})
```

## Authentication & Security

- **jsonwebtoken (jwt)**
  - **Function**: Generate and verify JWT for user session management.

```js
// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const decoded = jwt.verify(token, JWT_SECRET);
req.user = {
    id: decoded.id,
    username: decoded.username
};

// backend/models/User.js
const jwt = require('jsonwebtoken');
User.prototype.generateToken = function () {
    return jwt.sign(
        {id: this.id, username: this.username},
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};
```

- **bcryptjs**
  - **Function**: Hash and verify passwords securely with salt.

```js
// backend/models/User.js
const bcrypt = require('bcryptjs');
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)
});
User.beforeUpdate(async (user) => {
    if (user.changed('password')){
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)
    }
});
User.prototype.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
}

// backend/seeders/20260124233640-initial-users.js
const bcrypt = require('bcryptjs');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'root',
        password: await bcrypt.hash('root', 12),  
        email: 'root@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'admin',
        password: await bcrypt.hash('admin', 12),
        email: 'admin@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  }
};
```

## API Documentation

- **swagger-autogen + swagger-ui-express**
  - **Function**: Auto-generate Swagger API documentation and provide a visual interface.

```js
// backend/app.js
const swaggerDocument = require('./swagger_output.json');
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// backend/swagger.js
const swaggerAutogen = require('swagger-autogen')();
const doc = {
  info: {
    title: 'Bullet Note API documentation',        
    version: '1.0.0',                   
    description: 'Bullet Note backend interface documentation'
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
  console.log('✅ Swagger Configuration file generated successfully!');
});
```

## Utility Tools

- **Function**: AOP (Aspect-Oriented Programming) tool for unified logging, execution time tracking, and error handling.

```js
// backend/utils/aspect.js
function printResult(...args) {
    const isPrint = process.env.PrintResult === "1";
    if (isPrint) { 
        console.log(...args); 
    }
}
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const pad = n => n.toString().padStart(2, '0');
    const pad3 = n => n.toString().padStart(3, '0'); 
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad3(date.getMilliseconds())}`;
}
exports.createAspect = (fn) => {
    if(typeof fn !== 'function') {
        throw new Error('The element in list should be function');
    }
    const fnName = fn.name
    return async function(...args) {
        const startTime = Date.now();
        console.log(`Aspect log [${formatTime(startTime)}]: ${fnName} start to run`);
        try {
            const result = await fn.apply(this, args);
            const endTime = Date.now();
            console.log(`Aspect log [${formatTime(endTime)}]: ${fnName} run success, cost ${endTime - startTime}ms`);
            printResult(result);
            return result;
        } catch (error) {
            const errorTime = Date.now();
            console.error(`Aspect log [${formatTime(errorTime)}]: ${fnName} run failed`, error);
            const [, res] = args;
            if (res && typeof res.status === 'function' && typeof res.json === 'function') {
                res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
        }
    }
};
```

