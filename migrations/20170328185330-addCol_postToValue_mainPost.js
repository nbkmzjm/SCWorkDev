'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'mainPosts', 'postToValue',
      {
        type: Sequelize.STRING,
        defaultValue:"ALL"
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('mainPosts', 'mainPost');
  }
};