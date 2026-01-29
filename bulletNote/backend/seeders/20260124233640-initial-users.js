'use strict';

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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      username: ['admin', 'root'],
    }, {});
  }
};