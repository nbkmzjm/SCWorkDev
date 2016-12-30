'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'assignTracers', 'Read',
      {
        type: Sequelize.STRING,
        defaultValue: "0"
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'assignTracers', 'Read',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      } 
    )
  }
};
