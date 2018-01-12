'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'assignTracers', 'Read',
      {
        type: Sequelize.STRING
        
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'assignTracers', 'Read',
      {
        type: Sequelize.BOOLEAN
      } 
    )
  }
};