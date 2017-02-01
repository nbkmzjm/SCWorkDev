var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production'){
	
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize('database_development', 'nbkmzjm', 'fish1ing', {
	host:"localhost",
	dialect:'sqlite',
	storage: __dirname + '/data/dev-todo-api.sqlite',
	logging:false
	});
}


var db = {};	
db.assign = sequelize.import(__dirname + '/models/assign.js')
db.assignTracer = sequelize.import(__dirname + '/models/assignTracer.js');
db.assignTracerDetail = sequelize.import(__dirname + '/models/assignTracerDetail.js');
db.taskOption = sequelize.import(__dirname + '/models/taskOption.js');
db.taskOptMemo = sequelize.import(__dirname + '/models/taskOptMemo.js');
db.taskOptDetail = sequelize.import(__dirname + '/models/taskOptDetail.js');

db.sysObj = sequelize.import(__dirname + '/models/sysObj.js');

db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.group = sequelize.import(__dirname + '/models/group.js');
db.feedSetting = sequelize.import(__dirname + '/models/feedSetting.js');
db.settingDescription = sequelize.import(__dirname + '/models/settingDescription.js');
db.mainPost = sequelize.import(__dirname + '/models/mainPost.js');
db.userGroups = sequelize.import(__dirname + '/models/userGroups.js');
db.comment = sequelize.import(__dirname + '/models/comment.js');
db.department = sequelize.import(__dirname + '/models/department.js');
db.endpoint = sequelize.import(__dirname + '/models/endpoint.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.assign.belongsTo(db.user, {
	 onDelete: 'CASCADE'
});
db.user.hasMany(db.assign,{
	 onDelete: 'CASCADE'
});


db.assignTracer.belongsTo(db.assign, {
	 onDelete: 'CASCADE'
});
db.assign.hasMany(db.assignTracer, {
	 onDelete: 'CASCADE'
});


db.assignTracerDetail.belongsTo(db.assignTracer, {
	 onDelete: 'CASCADE'
});
db.assignTracer.hasMany(db.assignTracerDetail, {
	 onDelete: 'CASCADE'
});


db.assignTracer.belongsTo(db.user);
db.user.hasMany(db.assignTracer);


db.taskOptMemo.belongsTo(db.taskOption,{
	 onDelete: 'CASCADE'
});
db.taskOption.hasMany(db.taskOptMemo, {
	 onDelete: 'CASCADE'
});


db.taskOptDetail.belongsTo(db.taskOptMemo,{
	 onDelete: 'CASCADE'
});
db.taskOptMemo.hasMany(db.taskOptDetail, {
	 onDelete: 'CASCADE'
});

db.mainPost.belongsTo(db.user,{
	 onDelete: 'CASCADE'
});
db.user.hasMany(db.mainPost, {
	 onDelete: 'CASCADE'
});

db.user.belongsToMany(db.group, {through:'userGroups'});
db.group.belongsToMany(db.user, {through:'userGroups'});

db.group.belongsTo(db.user, {as:'groupBLUser'})

db.feedSetting.belongsTo(db.user,{
	onDelete: 'CASCADE'

})
db.user.hasMany(db.feedSetting , {as:'SettingUser'},{
	onDelete: 'CASCADE'
})

db.feedSetting.belongsTo(db.settingDescription)
// db.settingDescription.hasMany(db.)


db.comment.belongsTo(db.mainPost,{
	onDelete:'CASCADE'
})

db.mainPost.hasMany(db.comment,{
	onDelete:'CASCADE'
})

db.comment.belongsTo(db.user,{
	onDelete:'CASCADE'
})
db.user.hasMany(db.comment,{
	onDelete:'CASCADE'
})

db.user.belongsTo(db.department)
db.department.hasMany(db.user)

module.exports = db;