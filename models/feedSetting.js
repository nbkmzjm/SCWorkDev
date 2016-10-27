module.exports = function(sequelize, DataTypes) {

	return sequelize.define('feedSetting', {
		id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
    },
   
    value:{
        type: DataTypes.STRING,
        allowNull: false
    } 
    

	}, { timestamps: false})

};      