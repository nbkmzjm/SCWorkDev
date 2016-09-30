'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'groupId',
      {
        type: Sequelize.INTEGER,
        references: { model: 'groups', key: 'id' }
      }
     
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'users', 'groupId'
    )
  }
};
