var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.edit','ui.grid.resizeColumns', 'ui.grid.moveColumns', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'addressFormatter']);

angular.module('addressFormatter', []).filter('address', function () {
  return function (input) {
      return input.street + ', ' + input.city + ', ' + input.state + ', ' + input.zip;
  };
});

app.controller('MainCtrl', ['$scope', '$http', '$q', '$interval', function ($scope, $http, $q, $interval) {
  $scope.gridOptions = {
    enableSorting: true,
    columnDefs : [
    { name: 'PID', enableCellEditOnFocus:true, displayName:'Pid',  enableColumnResizing:false  },
    { name: 'Name', enableCellEditOnFocus:true, displayName:'Name',width: '20%',  maxWidth: 600, minWidth: 70  },
    { name: 'Ch_Name', enableCellEditOnFocus:true, displayName:'Ch_Name',  enableColumnResizing:true  },
    { name: 'Location', enableCellEditOnFocus:true, displayName:'Location',  enableColumnResizing:true  },
    { name: 'bizID', enableCellEditOnFocus:true, displayName:'bizID',  enableColumnResizing:true  },
    { name: 'Rating', enableCellEditOnFocus:true, displayName:'Rating',  enableColumnResizing:true  },
    { name: 'Comments', enableCellEditOnFocus:true, displayName:'Comments',  enableColumnResizing:true  },
    { name: 'Category', enableCellEditOnFocus:true, displayName:'Category',  enableColumnResizing:true  },
    { name: 'RegMsg', enableCellEditOnFocus:true, displayName:'RegMsg',  enableColumnResizing:true  },
    { name: 'AddedBy', enableCellEditOnFocus:true, displayName:'AddedBy',  enableColumnResizing:true  },
    { name: 'ModifiedBy', enableCellEditOnFocus:true, displayName:'ModifiedBy',  enableColumnResizing:true  },
    { name: 'Latitude', enableCellEditOnFocus:true, displayName:'Latitude',  enableColumnResizing:true  },
    { name: 'Longitude', enableCellEditOnFocus:true, displayName:'Longitude',  enableColumnResizing:true  },
    { name: 'ModifiedDate', enableCellEditOnFocus:true, visible:false},
    { name: 'Search_Icon', enableCellEditOnFocus:true, visible:false},
    { name: 'State', enableCellEditOnFocus:true, visible:false},
    { name: 'City', enableCellEditOnFocus:true, visible:false},
    { name: 'Language', enableCellEditOnFocus:true, visible:false},
    { name: 'AddedDate', enableCellEditOnFocus:true, visible:false}
  ]
};

  var num = 0;
  $scope.addNew = function() {
    $scope.gridOptions.data.unshift( {
      id: 'new_' + num,
      name: 'Name_' + num++
    } );
    $interval(function(){
      $scope.gridApi.rowEdit.setRowsDirty( $scope.gridApi.grid, [$scope.gridOptions.data[0]] );
    }, 1, 1);
  };
  
  $scope.saveRow = function( rowEntity ) {
    // create a fake promise - normally you'd use the promise returned by $http or $resource
    var promise = $q.defer();
    $scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );

    //create a promiose to update prestore row here  
       $scope.currentFocused = 'Row Id:' + rowEntity.PID ;

        $http.post('ajax/updPrestore1.php', JSON.stringify(rowEntity)).success(function (data) {
       console.log('type of data= ' + typeof(data));
       console.log('retMsg= ' + data[0].retMsg);
       $scope.retMsg= data[0].retMsg;

        }); 
      
      // fake a delay of 1 seconds whilst the save occurs, return error if retMsg is -1
    $interval( function() {
      if ($scope.retMsg === '-1' ){
        promise.reject();
      } else {
        promise.resolve();
      }
    }, 1000, 1);
  };

  $scope.uploadStore = function( ) {
      $http.post('ajax/uploadStore.php').success(function (data) {
       console.log('type of data= ' + typeof(data));
       console.log('retMsg= ' + data[0].retMsg);
       $scope.retMsg= data[0].retMsg;

        }); 
  };

    
  $scope.getCurrentFocus = function(){
  var rowCol = $scope.gridApi.cellNav.getFocusedCell();
  if(rowCol !== null) {
      $scope.currentFocused = 'Row Id:' + rowCol.row.entity.PID + ' col:' + rowCol.col.colDef.name + ' ModifiedDate:' +
          rowCol.row.entity.ModifiedDate      ;
  }
};

$scope.reloadPage = function() {
   $window.location.reload();
}
  $scope.gridOptions.onRegisterApi = function(gridApi){
    //set gridApi on scope
    $scope.gridApi = gridApi;
    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
  };

  $http.post('ajax/getPrestore.php')
    .success(function(data) {
      $scope.gridOptions.data = data;
    });
// mySQL function  
    
}]);
