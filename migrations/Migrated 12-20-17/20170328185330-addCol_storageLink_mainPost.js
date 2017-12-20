'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'mainPosts', 'storageLink',
      {
        type: Sequelize.STRING,
        defaultValue:""
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('mainPosts', 'storageLink');
  }
};