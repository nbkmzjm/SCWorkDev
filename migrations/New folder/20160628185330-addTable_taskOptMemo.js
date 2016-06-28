'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('taskOptMemos',{
      id:{
        type: Sequelize.INTEGER, 
        autoIncrement: true,
        primaryKey: true
      },
      memo: {
        type: Sequelize.STRING, 
        allowNull: false
      },
      taskOptId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'taskOption',
            key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    }) 
  },  
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('taskOptMemo')
  }
};



