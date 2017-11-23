$(document).ready(function() {
   $('#my_button').click(function() {
      check(something, function (valid) {
         if (valid) { // do something }
      });
   });

   check = function(param, callback) {
     $.ajax({
        // ajax params
        success: function(data) { 
            if (data){
               return callback(true);
            }
            else {
               return callback(false);
            }
        }
    });
});

}
}

var getFeedsPara = function(wherePara){
    return {
      attributes:['mainPostId'],
      where:{
        receivedUserId:curUserId,
        status:'commnet'
      },
      include:[{
        model:db.mainPost,
        where:wherePara,
        include:[{
          model:db.user,
          attributes:['name', 'lastname','departmentId', 'title'],
          include:[{
            model:db.department,
            attributes:['name']
          }]    
        }]          

      }],
      order:[
        [db.mainPost, 'createdAt', 'DESC']
      ],
      limit: 12,
      offset: loadNumber
    }
  }


var i = 0;
  function loopArrMemoOpt (arr){

    //- console.log(memoCheckOpts[i].value)
    dateSCSubmit(memoCheckOpts[i].value, userId, dateSC, taskSC, td)

    i++
    if (i < arr.length){
      loopArrMemoOpt(arr);
    }

  }
  loopArrMemoOpt(memoCheckOpts)



  