'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptMemos', 'type',
      {
        type: Sequelize.STRING,
        defaultValue: 'NONE',
        allowNull: false
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOptMemos', 'type');
  }
};