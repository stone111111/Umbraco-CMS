angular.module("umbraco")
.directive("umbUploadPreview",function($parse){
        return {
            link: function(scope, element, attr, ctrl) {
               var fn = $parse(attr.umbUploadPreview),
                                   file = fn(scope);
                if (file.preview) {
                    element.append(file.preview);
               }
            }
        };
})
.controller("Umbraco.PropertyEditors.FolderBrowserController",
    function ($rootScope, $scope, assetsService, $routeParams, $timeout, $element, $location, $log, umbRequestHelper, mediaResource, imageHelper, navigationService, editorState) {
        var dialogOptions = $scope.$parent.dialogOptions;

        $scope.creating = $routeParams.create;

        if(!$scope.creating){

            $scope.filesUploading = [];
            $scope.options = {                
                url: umbRequestHelper.getApiUrl("mediaApiBaseUrl", "PostAddFile"),
                autoUpload: true,
                disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
                previewMaxWidth: 200,
                previewMaxHeight: 200,
                previewCrop: true,
                formData:{
                    currentFolder: $routeParams.id
                }
            };


            $scope.loadChildren = function(id){
                mediaResource.getChildren(id)
                    .then(function(data) {
                        $scope.images = data.items;

                        var path = editorState.current.path;
                        navigationService.syncTree({ tree: "media", path: path, forceReload: true }).then(function (syncArgs) {
                            $log.log(syncArgs.node);
                        });
                    });    
            };

            $scope.$on('fileuploadstop', function(event, files){
                $scope.loadChildren($scope.options.formData.currentFolder);
                $scope.queue = [];
                $scope.filesUploading = [];
            });

            $scope.$on('fileuploadprocessalways', function(e,data) {
                var i;
                $scope.$apply(function() {
                    $scope.filesUploading.push(data.files[data.index]);
                });
            });

            // All these sit-ups are to add dropzone area and make sure it gets removed if dragging is aborted! 
            $scope.$on('fileuploaddragover', function(event, files) {
                if (!$scope.dragClearTimeout) {
                    $scope.$apply(function() {
                        $scope.dropping = true;
                    });
                } else {
                    $timeout.cancel($scope.dragClearTimeout);
                }
                $scope.dragClearTimeout = $timeout(function () {
                    $scope.dropping = null;
                    $scope.dragClearTimeout = null;
                }, 300);
            });
            
            //init load
            $scope.loadChildren($routeParams.id);
        }
});
