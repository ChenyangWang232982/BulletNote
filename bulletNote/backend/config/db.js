const { Sequelize } = require('sequelize');  //ORM tool
require('dotenv').config();
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env]
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        port: dbConfig.port,
        logging: false, // closed sql log
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        ssl: dbConfig.ssl,
        dialectOptions: dbConfig.ssl ? {
            ssl: {
                rejectUnauthorized: true,
                ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem'))
            }
    } : {}
    }
);

//connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connect successfully');

        await sequelize.sync({ alter: true
                            });  //synchronous content betweeb the database and project
        console.log('Synchronization completed')
    } catch (error) {
        console.error('MySQL connection failed: ', error.message);
        process.exit(1);
    }
};

module.exports={ sequelize, connectDB}