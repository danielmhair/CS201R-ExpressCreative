var myApp = angular.module('myApp',[]);

myApp.controller('CommentsController', ['$scope', '$http', function($scope, $http) {
    $scope.comments = [];
    $scope.name = "Mickey";
    $scope.pass = "mickeypass";
    $scope.comment = "Todo item";
    $scope.loggedIn = false;
    $scope.newUser = false;
    $scope.loginMessage = "";
    
    $scope.login = function() {
        var myobj = {"Name"     : $scope.name, 
                     "Password" : $scope.pass };
        $http({
            url: "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3006/credentials",
            method: "GET",
            params: myobj
        })
        .then(function(res) {
            console.log("Logged in");
            $scope.comments = [];
            $http.get("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3006/comment?Name="+$scope.name).success(function(data) {
                data.forEach(function(item) {
                    $scope.addComment(item.Comment);
                });
            });
            $scope.loggedIn = true;
            $scope.loginMessage = "";
            
        }).catch(function(err) {
            console.log(err);
            $scope.loginMessage = "Sorry, you need to create an account first. Please click 'Create a new Account'";
            $scope.loggedIn = false;
        });
    };
    
    $scope.logout = function() {
	$scope.comments = [];
        $scope.loggedIn = false;
        $scope.newUser = false;
        $scope.loginMessage = "";
    }
    
    $scope.register = function() {
        $scope.comments = [];
        $scope.loginMessage = "";
        $scope.newUser = true;
        $scope.postComment("Add todo items and get started on a very planned life!");
        $scope.loggedIn = true;
    }
    
    $scope.checkAuthThenComment = function() {
        
        if ($scope.loggedIn || $scope.newUser) {
            $scope.postComment($scope.comment);
        } else {
            $scope.postMessage = "Sorry, you are not logged in or have not registered";
        }
    };
    
    $scope.postComment = function(comment) {
        var myobj = {"Name"     : $scope.name, 
                     "Password" : $scope.pass, 
                     "Comment"  : $scope.comment };
        console.log(myobj);
console.log($scope.comment);
        var jobj = JSON.stringify(myobj);
        $http.post("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com:3006/comment", jobj, {headers: { 'Content-Type' : "application/json; charset=utf-8"}})
        .then(function(res) {
          console.log(res);
          var data = JSON.parse(res.config.data);
          console.log(data);
          $scope.addComment(data.Comment);
        })
        .catch(function(data, status) {
            console.log(data);
            console.log(status);
        });
    }
    
    $scope.addComment = function(addComment) {
    $scope.comments.push({comment:addComment});
    };

    $scope.removeComment = function(index) {
        $scope.comments.splice(index, 1);
    };
}]);