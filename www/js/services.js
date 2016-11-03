angular.module('starter.services', [])
.factory('Questions',function(ApiCall, $q,API){
  var questions = [];
  var self = this;
  var jumps = [];
  return {
    all: function() {
      return questions;
    },
    set: function(fields){
      questions = [];
      fields.forEach(function(field){
        questions.push({
          fieldId: field.id,
          value: '',
          type: field.type
        });
      });
      console.log(questions);
    },
    setValue: function(questionIndex,fieldId,value,jump){
      questions[questionIndex]['value'] = value;
      questions[questionIndex]['fieldId'] = fieldId;
      for (var i=1;i<jump;++i){
        questions[questionIndex+i].value = '';
      }
      jumps.push(jump);
    },
    getById: function(questionIndex){
      return questions[questionIndex];
    },
    getPreviousQuestion: function(){
      if (jumps.length == 0)
        return 1;
      return jumps.pop();
    },
    getAnswer: function(questionIndex){
      var val = questions[questionIndex].value;
      return val;
    },
    submit:function(surveyId){
      var d = $q.defer();
      // var i = 0;
      // var len = questions.length
      // for (i=0;i<len;i++){
      //   if (questions[i].type == 'textonly'){
      //     questions.splice(i,1);
      //     len--;
      //     i--;
      //   }
      // }
      var data = {
        surveyId: surveyId,
        fields: questions 
      };
      console.log("submit response", data);
      ApiCall(
        'POST',
        API.Domain +'/api/response/submit',
        data,
        function(returnData) {
          d.resolve(returnData)
        },
        function(error) {
          d.reject(error);
        }
        );
      return d.promise;
    }
  };
})
.factory('Surveys', function(ApiCall,$q,API) {
  // Might use a resource here that returns a JSON array
  var surveys = [];
  var getAll = function(){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/survey/getAll',
      null,
      function(returnData) {
        surveys = returnData.data.surveys;
        d.resolve(surveys);
      },
      function(error) {
        console.log(error);
      }
      );
    return d.promise;
  }
  var getById = function(surveyId){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/survey/' + surveyId,
      null,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData.data.survey);
      }, function(error){
        d.reject(error)
      });
    return d.promise;
  }
  return {
    getAll: getAll,
    getById: getById
  };
})
// .factory('Responses',function(ApiCall,$q){
//   var responses = [];
//   var questions = [];
//   var surveyId = null;
//   var self = this;
//   return {

//   }
// })
.factory('CompletedSurveys',function(){
  var surveys= [{
    id:0,
    name: "First completed survey",
    completed: 10,
    completedOn: "March 16th 2016",
    points: 50,
    description: "This is a completed survey about how it was completed",
    deadline: "01/01/2016",
    createdBy: "Khoa Phạm"
  },{
    id:1,
    name: "Second completed survey",
    completed: 15,
    completedOn: "March 17th 2016",
    points: 100,
    description: "This is a survey which is finished after the first survey",
    deadline: "02/02/2016",
    createdBy: "Anh Nguyễn"
  }];
  return {
    all: function(){
      return surveys;
    },
    get: function(surveyId){
      for(var i=0;i<surveys.length;i++){
        if (surveys[i].id === parseInt(surveyId)){
          return surveys[i];
        }
      }
      return null;
    }
  }
})
.factory('Feeds',function(ApiCall, $q,API){
  var feeds = [];
  var headline = function(){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/newsfeed/headline',
      null,
      function(returnData) {
        feeds = returnData.data.posts;
        d.resolve(feeds);
      },
      function(error) {
        console.log(error);
      }
      );
    return d.promise;
  }
  return {
    headline: headline,
    get: function(feedId){
      for (var i=0;i<feeds.length;++i){
        if (feeds[i].id === parseInt(feedId)){
          return feeds[i];
        }
      }
      return null;
    }
  }
})
.factory('ApiCall', function($http) {
  return function(method, url, data, success, fail) {
    var request = $http({
     method: method,
     url: url,
     data: data
   });
    return request.then(success, fail);
  }
})
.factory('Authentication',function($q, ApiCall,API){
  return function(data) {
    console.log(data);
    return ApiCall(
      'post',
            // TODO: fix hardcode
            API.Domain +'/api/login',
            data,
            function(returnData) {
              if (returnData.data.code == 'succeeded') {
                return returnData.data;
              } else {
                return $q.reject(returnData.data);
              }
            },
            function(error) {
              console.log(error);
            }
            );
  }
})
.factory('Register', function($q, ApiCall, API){
  return function(data) {
    console.log(data);
    return ApiCall(
      'post',
            API.Domain +'/api/signup',
            data,
            function(returnData) {
              if (returnData.data.code == 'succeeded') {
                return returnData.data;
              } else {
                return $q.reject(returnData.data);
              }
            },
            function(error) {
              console.log(error);
            }
            );
  }  
})
.factory('Camera', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
})
.factory('Responses',function($q, ApiCall,API){
  var responses = [];
  var getBySurveyId = function(surveyId){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain + '/api/response/getBySurvey/' + surveyId,
      null,
      function(returnData) {
        console.log(returnData);
        responses = returnData.data.responses.responses;
        d.resolve(responses);
      },
      function(error) {
        console.log(error);
      }
      );
    return d.promise;
  }
  var getResponseCount = function(surveyId){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain + '/api/response/getCountBySurvey/' + surveyId,
      null,
      function(returnData) {
        console.log(returnData);
        d.resolve(returnData.data.responses.responseCount);
      },
      function(error) {
        console.log(error);
      }
      );
    return d.promise;
   
  }
  return {
    getBySurveyId: getBySurveyId,
    getByResponseId: function(responseId) {
      console.log(responses,responseId);
      for (var i = 0; i < responses.length; i++) {
        if (responses[i].id === parseInt(responseId)) {
          return responses[i];
        }
      }
      return null;
    },
    getResponseCount: getResponseCount
  }
})
.factory('User',function($q,ApiCall,API){
  var user = null;
  var self = null;
  var getUserInfo = function(userId){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain + '/api/user/' + userId,
      null,
      function(returnData){
        console.log(returnData);
        user = returnData.data.user;
        user.avatar = API.Domain  + user.avatar;
        d.resolve(user);
      },
      function(error){
        console.log(error);
      });
    return d.promise;
  }
  return {
    getUserInfo: getUserInfo,
    setOwnedUserInfo : function(data){
      self = data;
    },
    getOwnedUserInfo: function(){
      return self;
    }
  }
})
.factory('Comments', function($q, ApiCall,API, User){
  var comments = [];
  var getComments = function(postId){
    var d = $q.defer();
    ApiCall(
      'GET',
      API.Domain + '/api/post/' + postId + '/comment',
      null,
      function(returnData){
        console.log(returnData);
        comments = returnData.data.comments;
        comments.forEach(function(comment){
          User.getUserInfo(comment.commenterId).then(function(data){
            comment.avatar = data.avatar;
            comment.commenterName = data.firstName + ' ' + data.lastName;
          }, function(error){
            console.log(error);
          })
        })
        d.resolve(comments);
      },
      function(error){
        console.log(error);
      });
    return d.promise;
  }
  var postComment = function(postId, description){
    var d = $q.defer();
    var data = {
      postId: postId,
      description: description
    }
    ApiCall(
      'POST',
      API.Domain + '/api/post/comment',
      data,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData);
      },
      function(error){
        d.reject(error);
      });
    return d.promise;
  }
  return{
    getComments: getComments,
    postComment: postComment
  }
})
.factory('Permissions', function($q, ApiCall,API){
  var surveys = [];
  var completedSurveys = [];
  var getPermissions = function(){
    var d =$q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/survey/permission',
      null,
      function(returnData){
        console.log(returnData);
        data = returnData.data.surveys;
        surveys = [];
        d.resolve(surveys);
        data.forEach(function(survey){
          if (survey.status == 'active')
            surveys.push(survey);
        })
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }
  var getCompletedSurveys = function(){
    var d =$q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/survey/permission',
      null,
      function(returnData){
        console.log(returnData);
        surveys = returnData.data.surveys;
        completedSurveys = [];
        surveys.forEach(function(survey){
          if (survey.status == 'completed')
            completedSurveys.push(survey);
        });
        d.resolve(completedSurveys);
      },
      function(err){
        console.log(err);
      });
    return d.promise;

  }
  var postPermission = function(surveyId){
    var data = {
      surveyId: surveyId
    };
    var d = $q.defer();
    ApiCall(
      'POST',
      API.Domain +'/api/survey/permission',
      data,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData);
      },
      function(err){
        d.reject(err);
      });
    return d.promise;
  }
    var getById = function(surveyId){
    var d =$q.defer();
    ApiCall(
      'GET',
      API.Domain +'/api/survey/' + surveyId + '/permission',
      null,
      function(returnData){
        console.log(returnData);
        surveys = returnData.data.permission;
        d.resolve(surveys);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }

  return {
    getPermissions: getPermissions,
    postPermission: postPermission,
    getById: getById,
    getCompletedSurveys: getCompletedSurveys
  }
})
.factory('Ratings',function($q,ApiCall,API){
  var ratings = [];

  var getRatings = function(userId){
        var d =$q.defer();

    ApiCall(
      'GET',
      API.Domain +'/api/rating/' + userId,
      null,
      function(returnData){
        console.log(returnData);
        ratings = returnData.data.ratings;
        d.resolve(ratings);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }

  var postRating = function(surveyId, comment, rating, userId){
        var d =$q.defer();

    var postData = {
      surveyId: surveyId,
      comment: comment,
      rating: rating
    }
    ApiCall(
      'POST',
      API.Domain +'/api/rating/' + userId,
      postData,
      function(returnData){
        console.log("rating: ",returnData);
        d.resolve(returnData);
      },
      function(err){
        console.log("rating error:" ,err);
      });
    return d.promise;
  }
  var getAverageRating = function(userId){
        var d =$q.defer();

    ApiCall(
      'GET',
      API.Domain +'/api/rating/average/' + userId,
      null,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData.data.averageRating);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }
  var getRatingStatus = function(surveyId){
        var d =$q.defer();

    ApiCall(
      'GET',
      API.Domain +'/api/rating/owner/survey/' + surveyId,
      null,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData.data.rated);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }


  return {
    getRatings : getRatings,
    postRating: postRating,
    getAverageRating: getAverageRating,
    getRatingStatus: getRatingStatus
  }
})

.factory('PostLikes',function($q,ApiCall,API){
  var ratings = [];

  var postLike = function(postId){
    var d =$q.defer();
    var data = {
      postId: postId
    };
    ApiCall(
      'POST',
      API.Domain +'/api/post/like',
      data,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }
  var postUnlike = function(postId){
        var d =$q.defer();
    var data = {
      postId: postId
    };
    ApiCall(
      'POST',
      API.Domain +'/api/post/unlike',
      data,
      function(returnData){
        console.log(returnData);
        d.resolve(returnData);
      },
      function(err){
        console.log(err);
      });
    return d.promise;
  }
  return {
    postLike : postLike,
    postUnlike: postUnlike
  }
})