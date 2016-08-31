module.exports = function(sequelize, DataTypes) {

	return sequelize.define('taskOptMemo', {
		id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
    },
    memo: {
        type: DataTypes.STRING, 
        allowNull: false
  	},
    checked:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    } ,
    type:{
        type:DataTypes.STRING,
        defaultValue: 'NONE',
        allowNull: false
    }

	}, { timestamps: true})

};      