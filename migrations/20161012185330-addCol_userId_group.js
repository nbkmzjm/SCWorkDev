'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'groups', 'userId',
      {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      } 
    )
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('groups', 'userId');
  }
};