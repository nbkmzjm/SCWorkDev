'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'userFeeds', 'tagSave',
      {
        type: Sequelize.STRING,
        defaultValue:' '
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('userFeeds', 'tagSave');
  }
};