'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'userFeeds', 'relationship',
      {
        type: Sequelize.STRING,
        defaultValue: ' '
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('userFeeds', 'relationship');
  }
};