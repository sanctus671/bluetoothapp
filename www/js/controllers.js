angular.module('app.controllers', [])

.controller('DiscoverCtrl', function($scope, $interval, $ionicModal, $state, BluetoothService) {
    $scope.devices = [];
    $scope.selectedDevice = {deviceId:null,code:null, error:false};
    $scope.loading = false;
    
    $interval(function(){
        BluetoothService.getDevices().then(function(data){
            $scope.devices = data;
        });
    },1000);
    
    
    $ionicModal.fromTemplateUrl('templates/modals/authorize-device.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.authorizeDeviceModal = modal;
    });   
    
    $scope.authorizeDevice = function(device){
        $scope.selectedDevice.deviceId = device.id; $scope.selectedDevice.name = device.name;
        $scope.authorizeDeviceModal.show();
    }
    
    $scope.openDevice = function(){
        $scope.selectedDevice.error = false;
        BluetoothService.getDevice($scope.selectedDevice.deviceId, $scope.selectedDevice.code).then(function(){
            $scope.authorizeDeviceModal.hide();
            var stateData = angular.copy($scope.selectedDevice);
            $scope.selectedDevice = {deviceId:null,code:null, error:false};
            $state.go("tab.discover-detail", stateData);            
        },function(){
            $scope.selectedDevice.error = true;
        })

    }
    
})
.controller('DiscoverDetailCtrl', function($scope, $state, $stateParams, $ionicPopup, $q, BluetoothService, DataService) {
    $scope.device = {};
    $scope.getDeviceData = function(){
        BluetoothService.getDevice($stateParams.deviceId, $stateParams.code).then(function(data){
            $scope.device = data;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.device.data = DataService.getDeviceData($scope.device.id);
        },function(){
            $scope.$broadcast('scroll.refreshComplete');
        })        
    }
    
    $scope.$on("$ionicView.enter", function(event, data){
       $scope.getDeviceData();
    });     
    
    $scope.collectAllData = function(){
        $scope.loading = true;
        $ionicPopup.show({
            template: '<div ng-if="loading" class="spinner-container"><ion-spinner></ion-spinner></div>\n\
                        <div ng-if="!loading"  class="collected-success">Data collected!</div>',            
            title: 'Collecting all device data',
            subTitle: 'This may take some time',
            scope: $scope,
            buttons: [
              { text: 'Close' },
            ]
          });    
          BluetoothService.getAllDeviceData($scope.device.id).then(function(){
              $scope.loading = false;
              $scope.getDeviceData();
          });          
    }
    
    $scope.collectNewData = function(){
        $scope.loading = true;
        $ionicPopup.show({
            template: '<div ng-if="loading" class="spinner-container"><ion-spinner></ion-spinner></div>\n\
                        <div ng-if="!loading" class="collected-success">Data collected!</div>', 
            title: 'Collecting new device data',
            subTitle: 'This may take some time',
            scope: $scope,
            buttons: [
              { text: 'Close' },
            ]
          }); 
          BluetoothService.getNewDeviceData($scope.device.id).then(function(){
              $scope.loading = false;
              $scope.getDeviceData();
          });
    }
    
    $scope.downloadFile = function(data, internalCall){
        var deferred = $q.defer();
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(data.dataFile);
        fileTransfer.download(
            uri,
            "///storage/emulated/0/" + data.deviceId + data.deivceName,
            function(entry) {
                console.log("download complete: " + entry.toURL());
                if (!internalCall){
                    $ionicPopup.show({
                        template: 'Your file has been downloaded', 
                        title: 'Download successful',
                        scope: $scope,
                        buttons: [
                          { text: 'Close' },
                        ]
                      }); 
                }
                deferred.resolve("///storage/emulated/0/" + data.deviceId + data.deivceName);
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
                if (!internalCall){
                $ionicPopup.show({
                    template: 'Error', 
                    title: 'There was an error trying to download this file',
                    scope: $scope,
                    buttons: [
                      { text: 'Close' },
                    ]
                  });  
                }
                deferred.reject();
            },
            true
        );
        return deferred.promise;  
    }
    
    $scope.shareFile = function(data){
        if (window.plugins && window.plugins.socialsharing){
            $scope.downloadFile(data,true).then(function(file){
                window.plugins.socialsharing.share('Bluetooth file: ' + data.dataId + " " + data.deviceName, data.dataId + " " + data.deviceName, file);
            });
            
        }
        
    }   
    
    $scope.disconnect = function(){
        $state.go("tab.discover");
    }

})
.controller('DataCtrl', function($scope, BluetoothService, $ionicPopup, $q, DataService) {
    $scope.shouldShowDelete = false;
    $scope.collectedData = [];
    $scope.getCollectedData = function(){
        $scope.collectedData = DataService.getAllData();
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    $scope.$on("$ionicView.enter", function(event, data){
       $scope.getCollectedData();
    }); 
    
    $scope.removeDataItem = function(dataId, index){
        DataService.removeData(dataId);
        $scope.getCollectedData();
    }
    
    
    $scope.downloadFile = function(data, internalCall){
        var deferred = $q.defer();
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(data.dataFile);
        fileTransfer.download(
            uri,
            "///storage/emulated/0/" + data.deviceId + data.deivceName,
            function(entry) {
                console.log("download complete: " + entry.toURL());
                if (!internalCall){
                    $ionicPopup.show({
                        template: 'Your file has been downloaded', 
                        title: 'Download successful',
                        scope: $scope,
                        buttons: [
                          { text: 'Close' },
                        ]
                      }); 
                }
                deferred.resolve("///storage/emulated/0/" + data.deviceId + data.deivceName);
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
                if (!internalCall){
                $ionicPopup.show({
                    template: 'Error', 
                    title: 'There was an error trying to download this file',
                    scope: $scope,
                    buttons: [
                      { text: 'Close' },
                    ]
                  });  
                }
                deferred.reject();
            },
            true
        );
        return deferred.promise;  
    }
    
    $scope.shareFile = function(data){
        if (window.plugins && window.plugins.socialsharing){
            $scope.downloadFile(data,true).then(function(file){
                window.plugins.socialsharing.share('Bluetooth file: ' + data.dataId + " " + data.deviceName, data.dataId + " " + data.deviceName, file);
            });
            
        }
        
    }       
})
