module.exports = function(sequelize, DataTypes) {

	return sequelize.define('mainPost', {
    	id:{
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true
        },
        postText: {
            type: DataTypes.TEXT, 
            allowNull: false
      	},
        postTo:{
            type: DataTypes.STRING
        },
        postToValue:{
            type: DataTypes.STRING,
            defaultValue: "ALL"
        },storageLink:{
            type: DataTypes.STRING,
            defaultValue: ""
        },
        type:{
            type: DataTypes.STRING
        },
        include:{
            type: DataTypes.STRING
        },
        exclude:{
            type: DataTypes.STRING
        }   

	},{
    scopes: {
        limit21: {
            limit:6 
        }
    }
    })

};   