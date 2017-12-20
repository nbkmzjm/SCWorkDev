'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'assignTracers', 'Read',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('assignTracers', 'Read');
  }
};
