'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'assignTracers', 'type',
      {
        type: Sequelize.STRING,
        defaultValue: 'SCHEDULE',
        allowNull: false
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('assignTracers', 'type');
  }
};