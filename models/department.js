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
            unique:true,
            set: function(value){
                this.setDataValue('name', value.toUpperCase())
            }
      	},
        status: {
            type: DataTypes.STRING,
            defaultValue: 'Active'
            
        }

	}, { timestamps: false})

};   