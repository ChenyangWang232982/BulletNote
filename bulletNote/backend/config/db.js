const { Sequelize } = require('sequelize');  //ORM tool
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.MYSQL_DB_NAME,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        port: process.env.MYSQL_PORT || 3306,
        logging: false, // closed sql log
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
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