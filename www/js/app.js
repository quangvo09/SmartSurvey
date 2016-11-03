// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'ionic.service.push', 'starter.constants', 'starter.controllers', 'starter.services','ionic-material','ionic-ratings'])

.run(function($ionicPlatform, $ionicPush) {
  $ionicPlatform.ready(function() {
    //TODO: load real user after login
    var details = {
      'email': 'iamcool@iamcool.com',
      'password': 'iamcool'
    }

    Ionic.Auth.signup(details)
    .then(function (result) {
        return true;
    })
    .catch(function (error) {
        console.log('Sign up failed', error);
        if (error.errors[0] === 'conflict_email') {
            return true;
        }
        return false;
    })
    .then(function (existUser) {
        if (existUser) {
            Ionic.Auth.login('basic', {}, details)
            .then(function (result) {
                $ionicPush.init({
                    "debug": false,
                    "onNotification": function(notification) {
                      var payload = notification.payload;
                      console.log(notification, payload);
                    },
                    "onRegister": function(data) {
                      console.log(data.token);
                      $ionicPush.saveToken(data);
                    }
                });
                $ionicPush.register();
            })
            .catch(function (error) {
                console.error('Login failed', error);
            });
        } else {
            console.error('User not logged in');
        }
    });

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    cordova.plugins.Keyboard.disableScroll(true);
  }
  if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
  }
  });
})
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider,$httpProvider,$compileProvider) {
  $ionicConfigProvider.tabs.position('bottom');
$ionicConfigProvider.backButton.previousTitleText(false);
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|http):/);
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('login',{
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('signup',{
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.feed', {
    url: '/feed',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tabs/tab-feed.html',
        controller: 'FeedCtrl'
      }
    }
  })

  .state('tab.mySurveys', {
    url: '/mySurveys',
    views: {
      'tab-my-survey': {
        templateUrl: 'templates/tabs/tab-my-survey.html',
        controller: 'MySurveyCtrl'
      }
    }
  })
  .state('tab.survey-detail', {
    url: '/survey-detail/:surveyId',
    views: {
      'tab-my-survey': {
        templateUrl: 'templates/survey-detail.html',
        controller: 'SurveyDetailCtrl'
      }
    }
  })
  .state('tab.survey-detail2', {
    url: '/survey-detail2/:surveyId',
    views: {
      'tab-feed': {
        templateUrl: 'templates/survey-detail.html',
        controller: 'SurveyDetailCtrl'
      }
    }
  })

  .state('tab.completed-survey-info',{
    url: '/completedSurveyInfo/:surveyId',
    views:{
      'tab-completed-survey':{
        templateUrl: 'templates/survey-info.html',
        controller: 'SurveyInfoCtrl'
      }
    }
  })
  .state('tab.survey-info',{
    url: '/surveyInfo/:surveyId',
    views:{
      'tab-my-survey':{
        templateUrl: 'templates/survey-info.html',
        controller: 'SurveyInfoCtrl'
      }
    }
  })
  .state('tab.response-detail',{
    url: '/responses/:surveyId/:responseId',
    views:{
      'tab-my-survey':{
        templateUrl: 'templates/response-detail.html',
        controller: 'ResponseDetailCtrl'
      }
    }
  })
  .state('tab.response-detail2',{
    url: '/responses2/:surveyId/:responseId',
    views:{
      'tab-feed':{
        templateUrl: 'templates/response-detail.html',
        controller: 'ResponseDetailCtrl'
      }
    }
  })

  .state('tab.responses',{
    url: '/responses/:surveyId',
    views:{
      'tab-my-survey':{
        templateUrl: 'templates/responses.html',
        controller: 'ResponsesCtrl'
      }
    }
  })
  .state('tab.responses2',{
    url: '/responses2/:surveyId',
    views:{
      'tab-feed':{
        templateUrl: 'templates/responses.html',
        controller: 'ResponsesCtrl'
      }
    }
  })

  .state('tab.dashboard',{
    url: '/dashboard',
    views:{
      'tab-dashboard':{
        templateUrl: 'templates/tabs/tab-dashboard.html',
        controller: "DashboardCtrl"
      }
    }
  })
  .state('tab.completedSurveys',{
    url: '/completedSurveys',
    views:{
      'tab-completed-survey':{
        templateUrl: 'templates/tabs/tab-completed-survey.html',
        controller: 'CompletedSurveyCtrl'
      }
    }
  })
  .state('tab.settings',{
    url: '/settings',
    views: {
      'tab-settings':{
        templateUrl: 'templates/tabs/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })
  .state('tab.surveyDescription',{
    url: '/surveyDescription/:surveyId/:postId/:liked',
    views:{
      'tab-feed':{
        templateUrl: 'templates/survey-description.html',
        controller: 'SurveyDescriptionCtrl'
      }
    }
  })
  .state('tab.profile',{
    url:'/profile/:userId',
    views:{
      'tab-feed':{
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })
  // .state('tab.account', {
  //   url: '/account',
  //   views: {
  //     'tab-account': {
  //       templateUrl: 'templates/tab-account.html',
  //       controller: 'AccountCtrl'
  //     }
  //   }
  // });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
