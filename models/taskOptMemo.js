module.exports = function(sequelize, DataTypes) {

	return sequelize.define('taskOption', {
		id:{
        type: DataTypes.INTEGER, 
        autoIncrement: true,
        primaryKey: true
      	},
      	memo: {
        type: DataTypes.STRING, 
        allowNull: false
      	},
      	taskOptId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'taskOption',
            key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }

	}, { timestamps: false})

};