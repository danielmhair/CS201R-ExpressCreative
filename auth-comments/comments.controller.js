var myApp = angular.module('myApp',[]);

myApp.controller('CommentsController', ['$scope', '$http', function($scope, $http) {
    $scope.comments = [];
    $scope.name = "Mickey";
    $scope.pass = "mickeypass";
    $scope.comment = "Todo item";
    
    $http.get("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com/comment").success(function(data) {
        data.forEach(function(item) {
            $scope.addComment(item.Name, item.Comment);
        });
    });
    
    $scope.postComment = function() {
        var myobj = {"Name"     : $scope.name, 
                     "Password" : $scope.pass, 
                     "Comment"  : $scope.comment };
        var jobj = JSON.stringify(myobj);
        $http({
            url: "http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com/credentials",
            method: "GET",
            params: jobj
        })
        .then(function(res) {
            if (res.status == 200) {
                $http.post("http://ec2-52-88-191-100.us-west-2.compute.amazonaws.com/comment", jobj, {headers: { 'Content-Type' : "application/json; charset=utf-8"}})
                .then(function(res) {
                  console.log(res);
                  var data = JSON.parse(res.config.data);
                  console.log(data);
                  $scope.addComment(data.Name, data.Comment);
                })
                .catch(function(data, status) {
                    console.log(data);
                    console.log(status);
                });
            }
        }).catch(function(err) {
            console.log(err);
        });
    };
    
    $scope.addComment = function(addName, addComment) {
        $scope.comments.push({name:addName, comment:addComment});
    };

    $scope.removeComment = function(index) {
        $scope.comments.splice(index, 1);
    };
}]);