module.exports = function(sequelize, DataTypes) {

	return sequelize.define('feedSetting', {
		id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
    },
    description: {
        type: DataTypes.STRING, 
        allowNull: false
  	},
    value:{
        type: DataTypes.STRING,
        allowNull: false
    } ,
    settingUserId:{
        type:DataTypes.INTEGER
    }

	}, { timestamps: false})

};      