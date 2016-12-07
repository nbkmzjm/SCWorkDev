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
		commentEmoj: {
			type: DataTypes.STRING,
			defaultValue:''
						
			
		},
		comment: {
			type: DataTypes.STRING,
			defaultValue:'',
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