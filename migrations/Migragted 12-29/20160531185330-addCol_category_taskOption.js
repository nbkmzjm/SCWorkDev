'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'taskOptions', 'category',
      {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [3, 20]  
        },
        defaultValue:''
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('taskOption', 'category');
  }
};
