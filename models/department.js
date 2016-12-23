module.exports = function(sequelize, DataTypes) {

	return sequelize.define('department', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING, 
            allowNull: false,
            set: function(value){
                this.setDataValue('name', value.toUpperCase())
            }
      	},
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: 'active'
            
        }

	}, { timestamps: false})

};   