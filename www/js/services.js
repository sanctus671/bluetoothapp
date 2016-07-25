angular.module('app.services', [])
//TODO: replace with actual bluetooth connection service
.service('BluetoothService', function ($q, $timeout, DataService){

    this.getDevices = function(){ //returns an array of objects with properties: id, name, code, memoryStatus, batteryStatus
        var deferred = $q.defer();         
        $timeout(function(){deferred.resolve(devices);},500);
        return deferred.promise;        
    };
    this.getDevice = function(id, code){ //return a single object with properties: id, name, code, memoryStatus, batteryStatus ONLY if the given code matches the devices code
        var deferred = $q.defer();         
        $timeout(function(){
            for (var index in devices){
                if (parseInt(devices[index].id) === parseInt(id) && parseInt(devices[index].code) === parseInt(code)){
                    deferred.resolve(devices[index]);return;
                }
            }
            deferred.reject();
        },500);
        return deferred.promise;        
    };
    this.getAllDeviceData = function(id, code){ //return data for a given device id if it exists as an object with properties: deviceId, deviceName, dataFile
        var deferred = $q.defer();         
        $timeout(function(){
            for (var index in deviceData){
                if (parseInt(deviceData[index].deviceId) === parseInt(id)){
                    DataService.saveData(deviceData[index]);
                }
            }
            deferred.resolve();
        },2000);
        return deferred.promise;        
    };
    this.getNewDeviceData = function(id, code){ //same as above except this checks with the local storage service below to ensure no double ups are stored locally
        var deferred = $q.defer();
        var existingData = DataService.getAllData(); //locally stored data which has been retreived in the past
        $timeout(function(){
            for (var index in deviceData){
                if (parseInt(deviceData[index].deviceId) === parseInt(id)){
                    var saveFile = true;
                    for (var index2 in existingData){
                        if(existingData[index2].dataFile === deviceData[index].dataFile){
                            saveFile = false; //data already exists so dont store it again                       
                        }
                    }
                    if (saveFile){
                        //do this if the data wasnt found
                        DataService.saveData(deviceData[index]);
                    }
                }
            }
            deferred.resolve();
        },2000);
        return deferred.promise;        
    };     

    
})

.service('DataService', function (){ //local storage service. this can most likely wont need changes
    this.getAllData = function(){
        var data = window.localStorage.bt_data ? JSON.parse(window.localStorage.bt_data) : [];     
        return data;
    };
    this.getDeviceData = function(deviceId){
        var DataService = this;
        var data = DataService.getAllData();
        var deviceData = [];
        for (var index in data){
            if (data[index].deviceId === deviceId){
                deviceData.push(data[index]);
            }
        }
        return deviceData;
    };    
    this.saveData = function(newData){
        var DataService = this;
        var data = DataService.getAllData();
        newData["dataId"] = data.length < 1 ? 1 : parseInt(data[data.length - 1].dataId) + 1; 
        newData["saveDate"] = new Date();
        data.push(newData); 
        window.localStorage.bt_data = JSON.stringify(data);
        return data;
    };  
    this.removeData = function(dataId){
        var DataService = this;
        var data = DataService.getAllData();
        for (var index in data){
            if (parseInt(data[index].dataId) === parseInt(dataId)){
                data.splice(index, 1);
            }
        }
        window.localStorage.bt_data = JSON.stringify(data);
        return data;
    };     
})


var devices = [
    {id:1, name:"123 Measuring board", code:1234, batteryStatus:80, memoryStatus:80},
    {id:2, name:"34545 Deck logger", code:1234, batteryStatus:80, memoryStatus:80},
    {id:3, name:"234 Field logger", code:1234, batteryStatus:80, memoryStatus:80},
    {id:4, name:"234234 Bench logger", code:1234, batteryStatus:80, memoryStatus:80} 
];
var deviceData = [
    {deviceId:1, deviceName:"Measuring board", dataFile: "test.csv"},
    {deviceId:1, deviceName:"Measuring board", dataFile: "test2.csv"},
    {deviceId:2, deviceName:"Deck logger", dataFile: "test2.csv"},
    {deviceId:3, deviceName:"Field logger", dataFile: "test2.csv"},
    {deviceId:4, deviceName:"Bench logger", dataFile: "test2.csv"}
];