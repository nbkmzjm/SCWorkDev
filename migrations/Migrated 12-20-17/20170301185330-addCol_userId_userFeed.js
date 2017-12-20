'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'userFeeds', 'userId',
      {
        type: Sequelize.INTEGER
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('userFeeds', 'userId');
  }
};