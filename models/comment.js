module.exports = function(sequelize, DataTypes) {

	return sequelize.define('comment', {
		// PTODate: {
		// 	type: DataTypes.DATE,
		// 	allowNull: false
			
		// },
		// id:{
  //           type: DataTypes.INTEGER, 
  //           autoIncrement: true,
  //           primaryKey: true
  //       },
		reaction: {
			type: DataTypes.STRING
						
			
		},
		comment: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [0, 999]	
			}
			
		}
		// ,
		// commentUser: {
		// 	type: DataTypes.INTEGER,
		// 	allowNull: false
			
		// }



	})

};