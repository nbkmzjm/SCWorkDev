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


ul.className = 'nav navbar-nav'


      arrayOption.forEach(function(taskOption, i){

          var li = document.createElement('li');
          li.style.color = 'blue';
          li.style.width = '200px'
          li.style.listStyle = 'none'
          
            var radio = document.createElement('input');
            radio.setAttribute('type','radio');
            radio.setAttribute('name','PTO');
            radio.setAttribute('value',taskOption);
            if (taskOption=='SELECT'){
              radio.setAttribute('checked','checked');
              li.addEventListener('click', function(){
                activeOptionText(taskOption)
              })  
            }

            if (taskOption=='PTO-R'||taskOption=='SWITCH-R'){
              li.addEventListener('click', function(){
                if ($('#memo').length>0){
                  ul.removeChild(document.getElementById('memo'))
                }

                activeOptionText(taskOption)

                var input = document.createElement('input');
                input.style.width = '240px';
                input.setAttribute('placeholder','Add Memo');
                input.setAttribute('type','text');
                input.setAttribute('id','memo');
                ul.insertBefore(input, li)
                
              })  
              
              li.appendChild(radio);
              li.appendChild(document.createTextNode(taskOption));
              ul.appendChild(li);
   
                
              
            } else if(taskOption=='NEW OPTION'&&(curUserTitle=='Admin'|| curUserTitle=='Manager')){
              li.addEventListener('click', function(){
              //- alert('radio click')
                activeOptionText(taskOption)
                if ($('#taskOption').length>0){
                  ul.removeChild(document.getElementById('taskOption'))
                  if($('#taskCategory').length>0){
                    ul.removeChild(document.getElementById('taskCategory'))
                  }
                }else{
                  var input2 = document.createElement('input');
                  input2.style.width = '120px';
                  input2.setAttribute('placeholder','Add Option');
                  input2.setAttribute('type','text');
                  input2.setAttribute('id','taskOption');
                  input2.addEventListener('blur', function(){
                    
                    var input = document.createElement('input');
                    input.style.width = '150px';
                    input.setAttribute('placeholder','Add Option Category');
                    input.setAttribute('type','text');
                    input.setAttribute('id','taskCategory');
                    input.addEventListener('blur', function(){
                    
                      var taskOptionData = $("#taskOption").val().toUpperCase();
                      var taskCategoryData = $("#taskCategory").val().toUpperCase();
                      if (taskCategoryData!=''&& taskCategoryData!=null){
                        $.post('/taskOption',{
                          taskOption:taskOptionData,
                          taskCategory:taskCategoryData
                        }).done(function(pData){
                        
                          if (pData.created==1){
                            taskOptionFct(i, pData.taskOption);

                            $('#taskOption').remove()
                            $('#taskCategory').remove()
                            ul.appendChild(li)
                            ul.appendChild(li)
                          }else{
                            $('#taskOption').$('#taskOption').remove()
                            $('#taskCategory').remove()
                          }
                        });
                      }else{
                      alert('new option is not added')
                      $('#taskOption').val('')
                      $('#taskCategory').val('')
                      }
                    });

                    ul.insertBefore(input, li)
                    $('#taskCategory').focus()
                  })
                  ul.insertBefore(input2, li)
                }
              })
              li.appendChild(radio);
              li.appendChild(document.createTextNode(taskOption));
              ul.appendChild(li);

            } else if(taskOption=='NEW OPTION'&&(curUserTitle!='Admin'|| curUserTitle!='Manager')){

            } else{
              li.addEventListener('click', function(){
                $('#memo').length>0?ul.removeChild(document.getElementById('memo')):''
                $('#taskOption').length>0 ? ul.removeChild(document.getElementById('taskOption')):''
                
                activeOptionText(taskOption)

                //- var input = document.createElement('input');
                //- input.style.width = '240px';
                //- input.setAttribute('placeholder','Add Memo');
                //- input.setAttribute('type','text');
                //- input.setAttribute('id','memo');
                //- ul.insertBefore(input, li)
              })
              li.appendChild(radio);
              li.appendChild(document.createTextNode(taskOption));
              ul.appendChild(li);
            }
            
          li.addEventListener('click',function(){
            radio.checked = 'checked'
          })
          
        

      })

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