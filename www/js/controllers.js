angular.module('starter.controllers', ['ngCordova','ngMap'])

.controller('FeedCtrl', function($scope, Feeds, User, API, ionicMaterialInk, ionicMaterialMotion, $timeout) {
  Feeds.headline().then(function(data){
    $scope.feeds = data;
    // $timeout(function() {
    //   ionicMaterialMotion.fadeSlideIn();
    // }, 500);

  console.log(data);
}, function(err){
  console.log(err);
});
  $scope.getTimeString = function(date){
    var d = new Date(date);
    var str = d.toString().substring(3,11) + ' at ';
    str = str + d.toString().substring(16,21);
    return str;
  }
  $scope.loadMore = function(){
    Feeds.headline().then(function(data){
      $scope.feeds = $scope.feeds.concat(data);
      $scope.$broadcast('scroll.infiniteScrollComplete');
    //   $timeout(function() {
    //     ionicMaterialMotion.fadeSlideIn({
    //       selector: '.animate-fade-slide-in .item'
    //     });
    //   }, 200);

    // // Activate ink for controller
    // ionicMaterialInk.displayEffect();

  },function(err){
    console.log(err);
  });
  }
  $scope.navigateToSurveyDescription = function(surveyId,postId,liked){
    console.log(surveyId);
    window.location.href = "#/tab/surveyDescription/" + surveyId +'/' + postId +'/' + (liked?1:0);
  }
  $scope.navigateToProfile = function(posterId){
    console.log(posterId);
    window.location.href= "#/tab/profile/" + posterId;
  }
  $scope.getImageUrl = function(avatar){
    return API.Domain  + avatar;
  }

})

.controller('MySurveyCtrl', function($scope, Surveys, Permissions) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
$scope.$on("$ionicView.beforeEnter", function(event, data){
  Permissions.getPermissions().then(
    function(data){
      if ($scope.surveys != data){
        $scope.surveys = [];
        $scope.surveys = data;
      }
    }, function(error){
      console.log(error);
    })
  console.log("State Params: ", data.stateParams);
});

// Surveys.getAll().then(
//   function(data){
//     $scope.surveys=data;
//     console.log(data);
//   });
$scope.getDeadline = function(deadline){
  var date = new Date(deadline);
  return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
}
})

.controller('SurveyDetailCtrl', function($scope, $stateParams, $ionicHistory,$ionicViewService,$ionicPopup, $state, Surveys, Questions, Camera,$cordovaGeolocation,$ionicLoading, SURVEY_FIELD_TYPE) {
  $scope.SURVEY_FIELD_TYPE = SURVEY_FIELD_TYPE;
  Surveys.getById($stateParams.surveyId).then(function(result){
    $scope.survey = result
    $scope.requiredMessage = false;
    console.log($scope.survey);
    $scope.number = 1;
    $scope.fieldCount = $scope.survey.fields.length;
    var fields = $scope.survey.fields;
    Questions.set(fields);
    var field = fields[$scope.number-1];
    $scope.question = field.description;
    $scope.options = field.options;
    $scope.type = field.type;
    $scope.required = field.isRequired;
    $scope.progress = parseInt($scope.number/fields.length*100);
    $scope.image = "";
    $scope.data = {
      selected: null,
      text: ""
    };
    if (field.type == 'checklist'){
      $scope.newPage={
        url:"templates/surveys/checklist.html"};
      }
      else if (field.type == 'multiple'){
        $scope.newPage={
          url:"templates/surveys/multiplechoice.html"
        };
      }
      else if (field.type == 'dropdown'){
        $scope.data.selected = $scope.options[0];
      }
      else if (field.type == 'scale'){
        $scope.data.selected = 5;
      }

    },function(error){
      console.log(error);
    });
var options = {
  sourceType: 1,
  destinationType: 0,
  targetWidth: 300,
  targetHeight: 300
};
$scope.getTextFromRangeValue = function(value){
  if (value >=0 && value <= 1){
    return 'Strongly disagree';
  }
  else if (value > 1 && value <5){
    return 'Disagree';
  }
  else if (value == 5){
    return 'Neutral';
  }
  else if (value > 5 && value < 9){
    return 'Agree';
  }
  else 
    return 'Strongly agree';
}
$scope.getPhoto = function() {
  Camera.getPicture(options).then(function(imageData) {
    console.log(imageData);
    $scope.image = "data:image/jpeg;base64," + imageData;
  }, function(err) {
    console.err(err);
  });
};
$scope.positions = [];
$scope.$on('mapInitialized', function(event, map) {
  console.log(map);
  $scope.map = map;
  $ionicLoading.show({
    template: 'Loading...'
  });

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    var lat  = position.coords.latitude;
    var long = position.coords.longitude;
    $scope.positions.push({lat:lat,long:long});
    $scope.map.setCenter(new google.maps.LatLng(lat,long));
    $ionicLoading.hide();
  }, function(err) {
    console.log(err);
  });

});

$scope.centerOnMe= function(){
  $scope.positions = [];


  $ionicLoading.show({
    template: 'Loading...'
  });

  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $cordovaGeolocation
  .getCurrentPosition(posOptions)
  .then(function (position) {
    var lat  = position.coords.latitude;
    var long = position.coords.longitude;
    $scope.positions.push({lat:lat,long:long});
    $scope.map.setCenter(new google.maps.LatLng(lat,long));
    $ionicLoading.hide();
  }, function(err) {
    console.log(err);
  });
};
$scope.nextQuestion = function(){
  var type = $scope.type;
  var fieldId = $scope.survey.fields[$scope.number-1].id;
  var isRequired = $scope.survey.fields[$scope.number-1].isRequired;
  var val = "";
  var jump = 0;
  if (type == 'multiple' || type == 'dropdown'){
    val = $scope.data.selected;
    if (val)
      jump = arrayObjectIndexOf($scope.survey.fields[$scope.number-1].options,val , 'id').jump;
  }
  else if (type == 'scale'){
    val = $scope.data.selected
  }
  else if (type == 'checkbox'){
    console.log($scope.options);
    val = [];
    $scope.options.forEach(function(option){
      if (option.checked == true){
        val.push(option.id);
      }
    })
    if (val.length == 0){
      val = "";
    }

  }

  else if (type =='text' || type =='paragraph'){
    val = $scope.data.text;
  }
  else if (type == 'picture'){
    val = $scope.image;
  }
  else if (type == 'gps'){
    val = {
      latitude: $scope.positions[0].lat,
      longtitude: $scope.positions[0].long
    }
  }
  console.log($scope.number-1,fieldId,val,isRequired);
  if (val || (isRequired == false && !val)) {
    Questions.setValue($scope.number-1,fieldId,val, jump? jump:1);
    $scope.requiredMessage = false;
  }
  else if (isRequired == true && (!val)){
    $scope.requiredMessage = true;
    return;
  }
  if (jump >0){
    $scope.number = $scope.number + jump;
  }
  else {
    $scope.number = $scope.number +1;
  }
  if ($scope.number > $scope.survey.fields.length){
    Questions.submit($scope.survey.id).then(function(data){
      console.log(data);
      $ionicHistory.goBack();
    },function(error){
      console.log(error);
      $ionicHistory.goBack();
    });
    return;
  }
  var value = Questions.getAnswer($scope.number-1);
  var fields = $scope.survey.fields;
  var field = fields[$scope.number-1];
  $scope.question = field.description;
  $scope.options = field.options;
  $scope.type = field.type;
  $scope.required = field.isRequired;
  $scope.progress = parseInt($scope.number/fields.length*100);
  $scope.data.selected = 0;
  $scope.data.text = "";
  $scope.image = "";
  $scope.positions = [];
  if (value){
    if ($scope.type == 'multiple' || $scope.type == 'checkbox' || $scope.type == 'scale'){
      $scope.data.selected = value;
    }
    else if ($scope.type == 'text' || $scope.type == 'paragraph'){
      $scope.data.text = value;
    }
    else if ($scope.type == 'checkbox'){

    }
    else if ($scope.type == 'picture'){
      $scope.image = val;
    }
    else if ($scope.type == 'gps'){
      $scope.positions[0].lat = value.latitude;
      $scope.positions.long = value.longtitude;
    }
  }
}
$scope.backQuestion = function(){
  if ($scope.number == 1)
    return;
  var prev = Questions.getPreviousQuestion();
  $scope.number = $scope.number-prev;
  var value = Questions.getAnswer($scope.number-1);
  var fields = $scope.survey.fields;
  var field = fields[$scope.number-1];
  $scope.requiredMessage = false;
  $scope.question = field.description;
  $scope.options = field.options;
  $scope.type = field.type;
  $scope.required = field.isRequired;
  $scope.progress = parseInt($scope.number/fields.length*100);
  $scope.data.selected = 0;
  $scope.data.text = "";
  $scope.image = "";
  $scope.positions = [];
  if (value){
    if ($scope.type == 'multiple' || $scope.type == 'checkbox' || $scope.type == 'scale'){
      $scope.data.selected = value;
    }
    else if ($scope.type == 'text' || $scope.type == 'paragraph'){
      $scope.data.text = value;
    }
    else if ($scope.type == 'checkbox'){

    }
    else if ($scope.type == 'picture'){
      $scope.image = val;
    }
    else if ($scope.type == 'gps'){
      $scope.positions[0].lat = value.latitude;
      $scope.positions.long = value.longtitude;
    }
  }

}
$scope.finish = function()
{
  var type = $scope.type;
  var fieldId = $scope.survey.fields[$scope.number-1].id;
  var val = "";
  var isRequired = $scope.survey.fields[$scope.number-1].isRequired;
  if (type == 'multiple' || type == 'dropdown' || type=='scale'){
    val = $scope.data.selected;
  }
  else if (type == 'checkbox'){
    console.log($scope.options);
    val = [];
    $scope.options.forEach(function(option){
      if (option.checked == true){
        val.push(option.id);
      }
    })
    if (val.length ==0)
      val = "";
  }
  else if (type =='text' || type =='paragraph'){
    val = $scope.data.text;
  }
  else if (type == 'picture'){
    val = $scope.image;
  }
  else if (type == 'gps'){
    val = {
      latitude: $scope.positions[0].lat,
      longtitude: $scope.positions[0].long
    }
  }
  console.log($scope.number-1,fieldId,val,isRequired);
  if (val){
    Questions.setValue($scope.number-1,fieldId,val);
    $scope.requiredMessage =false;
  }
  else if (isRequired == true && (!val)){
    $scope.requiredMessage = true;       
    return;
  }

  Questions.setValue($scope.number-1,fieldId,val);

  Questions.submit($scope.survey.id).then(function(data){
    console.log(data);
    $ionicHistory.goBack();
  },function(error){
    console.log(error);
    $ionicHistory.goBack();
  });
}
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = { 
    enableFriends: true
  };
})

.controller('DashboardCtrl',function($scope,$http, User, API, Ratings){
  console.log($http.defaults.headers.common.Authorization);
  $scope.user = User.getOwnedUserInfo();
  $scope.array = [];
  console.log($scope.user);
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    Ratings.getAverageRating($scope.user.id).then(function(data){
      console.log(data);
      $scope.averageRating = data? data: 1;
      $scope.array = [];
      $scope.array.push({
        rating: data,
        minRating:0,
        readOnly: true
      });
    }, function(error){
      console.log(error)
    })
  });
  Ratings.getRatings($scope.user.id).then(function(data){
    $scope.ratings = data;
    console.log($scope.ratings);
    $scope.ratings.forEach(function(rating){
      rating.ratingObject = {
        iconOnColor: 'rgb(255, 255, 0)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  rating.rating, //Optional
        readOnly: true, //Optional
      }
    })
  }, function(err){
    console.log(err)
  })
  $scope.getImageUrl = function(avatar){
    return API.Domain + avatar;
  }
})

.controller('CompletedSurveyCtrl',function($scope, CompletedSurveys, Permissions, Responses){
 Permissions.getCompletedSurveys().then(function(data){
    $scope.surveys = data;
    $scope.surveys.forEach(function(survey){
      Responses.getResponseCount(survey.id).then(function(data){
        survey.responseCount = data;
      }, function(error){
        console.log(error);
      })
    })
  })
  console.log($scope.surveys);
})

.controller('SettingsCtrl',function($scope,$ionicTabsDelegate){
  $scope.goForward = function () {
    var selected = $ionicTabsDelegate.selectedIndex();
    if (selected != -1) {
      $ionicTabsDelegate.select(selected + 1);
    }
  }

  $scope.goBack = function () {
    var selected = $ionicTabsDelegate.selectedIndex();
    if (selected != -1 && selected != 0) {
     $ionicTabsDelegate.select(selected - 1);
   }

 }})

.controller('SurveyInfoCtrl',function($scope,$stateParams, $state, Surveys, Responses,$ionicPopup, $window, Ratings){
  $scope.data = {
    comment: '',
    ratingComment: ''
  };
  $scope.$on("$ionicView.beforeEnter", function(event, data){
    if ($scope.survey == null)
      return;
    Responses.getBySurveyId(data.stateParams.surveyId).then(function(data){
      $scope.survey.responsesCount = data.length;
      Ratings.getRatingStatus($stateParams.surveyId).then(function(data){
        $scope.rated = data;
        if (!$scope.rated && $scope.survey.responsesCount >= $scope.survey.submissionPerPerson){
          $ionicPopup.show({
            title: 'Rate this survey',
            template: "<ionic-ratings ratingsobj='ratingsObject' style='font-size:30px;'></ionic-ratings><label style='padding-top:0px;'class='item-input item-floating-label'><input type='text' ng-model='data.ratingComment' placeholder='Optional comment'>",
            scope: $scope,
            buttons: [{
              text:'Submit',
              type: 'button-positive',
              onTap: function(e){
                $scope.submitRating();
              }
            },{
              text:'Cancel',
              type: 'button-default',

            }]
          });

        }
      },function(error){
        console.log(error);
      })
    });

  });

Surveys.getById($stateParams.surveyId).then(function(result){
  $scope.survey = result;
  Responses.getBySurveyId($stateParams.surveyId).then(function(data){
    $scope.survey.responsesCount = data.length;
    Ratings.getRatingStatus($stateParams.surveyId).then(function(data){
      $scope.rated = data;
      if (!$scope.rated && $scope.survey.responsesCount >= $scope.survey.submissionPerPerson){
        $ionicPopup.show({
          title: 'Rate this survey',
          template: "<ionic-ratings ratingsobj='ratingsObject' style='font-size:30px;'></ionic-ratings><label style='padding-top:0px;'class='item-input item-floating-label'><input type='text' ng-model='data.ratingComment' placeholder='Optional comment'>",
          scope: $scope,
          buttons: [{
            text:'No thanks',
            type: 'button-default',

          },{
            text:'Submit',
            type: 'button-positive',
            onTap: function(e){
              $scope.submitRating();
            }
          }]
        });

      }
    },function(error){
      console.log(error);
    })

  });

}, function(error){
  console.log(error);
})
$scope.submitResponse = function(){
  if ($scope.survey.responsesCount >= $scope.survey.submissionPerPerson){
    $ionicPopup.alert({
      title: 'Alert',
      template: 'You have reached the limit of submissions'
    });
  }
  else
    if ($scope.survey.status == 'pending'){
      $ionicPopup.alert({
        title: 'Alert',
        template: 'This survey has not been ready to submit yet.'
      })
    }
    else
      $window.location.href="#/tab/survey-detail/" + $scope.survey.id;
  }
  $scope.getDeadline = function(deadline){
    var date = new Date(deadline);
    return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
  }
  $scope.viewResponse = function(id){
    window.location.href = "#/tab/responses/" + id;
  }
  $scope.ratingsObject = {
        iconOn: 'ion-ios-star',    //Optional
        iconOff: 'ion-ios-star-outline',   //Optional
        iconOnColor: 'rgb(255, 255, 0)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  0, //Optional
        minRating:0,    //Optional
        readOnly: false, //Optional
        callback: function(rating) {    //Mandatory
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function(rating) {
        console.log('Selected rating is : ', rating);
        $scope.rating = rating;
      };
      $scope.submitRating = function(){
        Ratings.postRating($scope.survey.id,$scope.data.ratingComment,$scope.rating, $scope.survey.creatorId).then(function(data){
          console.log(data);
          $scope.rated = true;
        }, function(error){
          console.log(error)
        })
      }
    })
.controller('LoginCtrl',function($scope,$state,Authentication, User, $http, $ionicHistory,$rootScope, $ionicPush){
  $scope.user = null;
  $scope.truePassword = false;
  $scope.signIn = function(user){
   var data = {
    userName: user.username,
    password: user.password,
    platform: "mobile",
    deviceToken: $ionicPush._token._token
  }

  Authentication(data)
  .then(function(result) {
    User.setOwnedUserInfo(result.userInfo);
    $http.defaults.headers.common['Authorization'] = result.authorization;
    $scope.truePassword = false;
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $state.go('tab.dashboard');
    console.log(result);
  }, function(result) {
    $scope.truePassword = true;
    console.log($ionicPush._token._token);
    console.log(result);
  });
}
})

.controller('SignupCtrl',function($scope,$state,Register, User, $http, $ionicHistory,$rootScope, $ionicPush){
  $scope.user = null;
  $scope.signUp = function(user){
   var data = {
    userName: user.username,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName
  }
 Register(data)
  .then(function(result) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    console.log(result);
    $state.go('login');
  }, function(result) {
    console.log(result);
  });  
  }

  // Authentication(data)
  // .then(function(result) {
  //   User.setOwnedUserInfo(result.userInfo);
  //   $http.defaults.headers.common['Authorization'] = result.authorization;
  //   $scope.truePassword = false;
  //   $ionicHistory.nextViewOptions({
  //     disableBack: true
  //   });

  //   $state.go('tab.dashboard');
  //   console.log(result);
  // }, function(result) {
  //   $scope.truePassword = true;
  //   console.log($ionicPush._token._token);
  //   console.log(result);
  // });
})

.controller('ResponsesCtrl',function($scope,$stateParams, Responses, $ionicTabsDelegate){
  $scope.responses = [];
  $scope.surveyId = $stateParams.surveyId;
  if ($ionicTabsDelegate.selectedIndex() == 2){
    $scope.tab = "";
  }
  else{
    $scope.tab = "2";
  }
  Responses.getBySurveyId($scope.surveyId).then(function(data){
    $scope.responses = data;
    console.log(data);
  })

})
.controller('ResponseDetailCtrl',function($scope,$stateParams,Responses,Surveys){
  var surveyId = $stateParams.surveyId;
  var responseId = $stateParams.responseId;
  var answers = Responses.getByResponseId(responseId).fields;
  var survey = null;
  Surveys.getById(surveyId).then(function(result){
    survey = result;
    console.log(answers);
    $scope.fields = survey.fields;
    for (i=0; i< $scope.fields.length; ++i){
      console.log($scope.fields[i]);
      if (answers[i].value == null || answers[i].value == "" || answers[i].value.length == 0 ){
        $scope.fields[i].answer = 'No answer';
      }
      else if ($scope.fields[i].type == 'checkbox'){
        $scope.fields[i].answer = "";
        answers[i].value.forEach(function(val){
          $scope.fields[i].answer += arrayObjectIndexOf($scope.fields[i].options, val, "id").description + ', ';
        });
        $scope.fields[i].answer = $scope.fields[i].answer.substring(0,$scope.fields[i].answer.length -2);
      }
      else if ($scope.fields[i].type == 'gps')
        $scope.fields[i].answer = "latitude: " + answers[i].value.latitude + " longtitude: " + answers[i].value.longtitude ;
      else
        if ($scope.fields[i].type == 'picture' || $scope.fields[i].type =='text' || $scope.fields[i].type == 'paragraph')
          $scope.fields[i].answer = answers[i].value;
        else if ($scope.fields[i].type == 'scale')
          $scope.fields[i].answer = answers[i].value;
        else
          $scope.fields[i].answer = arrayObjectIndexOf($scope.fields[i].options, answers[i].value, "id").description;
      }
      console.log($scope.fields);

    }, function(error){
      console.log(error)
    });
answers.sort(function(a, b) {
  return a.fieldId - b.fieldId;
});


})
.controller('SurveyDescriptionCtrl',function($scope,$stateParams, $ionicPopup, Surveys,User, Comments, API, Permissions, Responses, Ratings, PostLikes){
  $scope.comments = [];
  $scope.status = null;
  $scope.data = {
    comment: null,
    ratingComment: ''
  };
  $scope.isLiked = $stateParams.liked;
  $scope.ratingsObject = {
        iconOn: 'ion-ios-star',    //Optional
        iconOff: 'ion-ios-star-outline',   //Optional
        iconOnColor: 'rgb(255, 255, 0)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  0, //Optional
        minRating:0,    //Optional
        readOnly: false, //Optional
        callback: function(rating) {    //Mandatory
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function(rating) {
        console.log('Selected rating is : ', rating);
        $scope.rating = rating;
      };
      $scope.submitRating = function(){
        Ratings.postRating($scope.survey.id,$scope.data.ratingComment,$scope.rating, $scope.survey.creatorId).then(function(data){
          console.log(data);
          $scope.rated = true;
        }, function(error){
          console.log(error)
        })
      }

      $scope.myInfo = User.getOwnedUserInfo();
      Surveys.getById($stateParams.surveyId).then(function(result){
        $scope.survey = result;
        User.getUserInfo($scope.survey.creatorId).then(function(data){
          $scope.user = data;
        },function(err){
          console.log(err);
        });


}, function(error){
  console.log(error);
});
$scope.postId = $stateParams.postId;
$scope.$on("$ionicView.beforeEnter", function(event, data){
  if (!$scope.survey){
    Responses.getBySurveyId(data.stateParams.surveyId).then(function(data){
      $scope.responses = data;
      Ratings.getRatingStatus($stateParams.surveyId).then(function(data){
        $scope.rated = data;
        if (!$scope.rated && $scope.responses.length >= $scope.survey.submissionPerPerson){
          $ionicPopup.show({
            title: 'Rate this survey',
            template: "<ionic-ratings ratingsobj='ratingsObject' style='font-size:30px;'></ionic-ratings><label style='padding-top:0px;'class='item-input item-floating-label'><input type='text' ng-model='data.ratingComment' placeholder='Optional comment'>",
            scope: $scope,
            buttons: [{
              text:'Cancel',
              type: 'button-default'
            },{
              text:'Submit',
              type: 'button-positive',
              onTap: function(e){
                $scope.submitRating();
              }

            }]
          });

        }
      },function(error){
        console.log(error);
      })
    });
  }
  Permissions.getById(data.stateParams.surveyId).then(function(data){
    console.log('Permission: ', data);
    if (data == undefined){
      $scope.permission = {
        status: 'unactive'
      };
    }
    else
      $scope.permission = data;
  }, function(error){
    console.log(error);
  })
  Comments.getComments($scope.postId).then(function(data){
    $scope.comments = data;
    console.log($scope.comments);
  }, function(err){
    console.log(err);
  })
  console.log("State Params: ", data.stateParams);

})

$scope.postLike = function(){
  PostLikes.postLike($scope.postId).then(function(data){
    $scope.isLiked = 1;
  }, function(error){
    console.log(error);
  })
}
$scope.postUnlike = function(){
  PostLikes.postUnlike($scope.postId).then(function(data){
  $scope.isLiked = 0;
  }, function(error){
    console.log(error);
  })
}
$scope.postComment= function(){
  Comments.postComment($scope.postId,$scope.data.comment).then(function(data){
    console.log(data);
    $scope.data.comment = '';
  }, function(err){
    console.log(err);
  })
  $scope.comments.unshift({
    commenterName: $scope.myInfo.firstName + ' ' + $scope.myInfo.lastName,
    avatar: API.Domain + $scope.myInfo.avatar,
    description: $scope.data.comment
  })  
  cordova.plugins.Keyboard.close();
}
$scope.getDeadline = function(deadline){
  var date = new Date(deadline);
  return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
}
$scope.getImageUrl = function(avatar){
  return API.Domain  + avatar;
}
$scope.requestPermission = function(surveyId){
  Permissions.postPermission(surveyId).then(function(data){
    console.log(data);
    if ($scope.survey.needApproval == false)
      $scope.permission = {
        status: 'onGoing'
      };
      else if ($scope.survey.needApproval == true){
        $scope.permission = {
          status: 'needApproval'
        };
      }
    }, function(error){
      console.log(error)
    });
}

})
.controller('ProfileCtrl', function($scope,$stateParams, User, Ratings, API){
  User.getUserInfo($stateParams.userId).then(function(data){
    $scope.user = data;
  },function(err){
    console.log(err);
  });
  $scope.array = [];
  Ratings.getRatings($stateParams.userId).then(function(data){
    $scope.ratings = data;
    console.log($scope.ratings);
    $scope.ratings.forEach(function(rating){
      rating.ratingObject = {
        iconOnColor: 'rgb(255, 255, 0)',  //Optional
        iconOffColor:  'rgb(200, 100, 100)',    //Optional
        rating:  rating.rating, //Optional
        readOnly: true, //Optional
      }
    })
  }, function(err){
    console.log(err)
  })
  Ratings.getAverageRating($stateParams.userId).then(function(data){
    console.log(data);
    $scope.averageRating = data? data: 1;
    $scope.array.push({
      rating: data,
      minRating:0,
      readOnly: true
    });
  }, function(error){
    console.log(error)
  })
  $scope.getImageUrl = function(avatar){
    return API.Domain + avatar;
  }
  $scope.getRounded = function(number){
    return Math.round(number*10)/10;
  }

})
.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
})
function arrayObjectIndexOf(myArray, searchTerm, property) {
  for(var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return myArray[i];
  }
  return null;
}
 // 1
