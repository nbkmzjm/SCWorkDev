'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'settingDescriptions', 'defaultValue',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'friend'
      } 
    )
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.removeColumn('settingDescriptions', 'settingDescriptions');
  }
};
