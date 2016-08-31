'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptMemos', 'updatedAt',
      {
        type: Sequelize.DATE
      } 
    )
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOptMemos', 'updatedAt');
  }
};