'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptMemos', 'createdAt',
      {
        type: Sequelize.DATE
      } 
    )
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOptMemos', 'createdAt');
  }
};