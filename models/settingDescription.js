module.exports = function(sequelize, DataTypes) {

	return sequelize.define('settingDescription', {
		id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
    },
    description: {
        type: DataTypes.STRING, 
        allowNull: false
  	},
    defaultValue:{
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: 'friend'
    }
   

	}, { timestamps: false})

};      