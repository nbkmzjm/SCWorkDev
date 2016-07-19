'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptMemos', 'checked',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOptMemos', 'checked');
  }
};
