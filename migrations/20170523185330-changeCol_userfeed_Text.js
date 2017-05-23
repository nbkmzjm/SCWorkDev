'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'userFeeds', 'notifText',
      {
        type: Sequelize.TEXT
        
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn(
      'userFeeds', 'notifText',
      {
        type: Sequelize.STRING
      } 
    )
  }
};
