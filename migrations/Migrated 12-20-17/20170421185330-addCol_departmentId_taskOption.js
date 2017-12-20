'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptions', 'departmentId',
      {
        type: Sequelize.INTEGER,
        defaultValue:1
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOptions', 'departmentId');
  }
};