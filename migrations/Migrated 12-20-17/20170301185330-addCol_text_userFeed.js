'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'userFeeds', 'notifText',
      {
        type: Sequelize.STRING
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('userFeeds', 'notifText');
  }
};