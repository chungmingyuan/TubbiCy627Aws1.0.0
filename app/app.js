var cusine_types_en = ["Schezwan", "Taiwanese", "Beijing", "Cantonese"];
var cusine_types_ch = ["川菜", "台灣小吃", "京菜", "廣東菜"];
var init_markers = [];
var init_map;
var app = angular.module('myApp', ['ui.bootstrap', 'geolocation']);
//
app.controller("autoCompleteAddressCrtl", function ($scope) {
    $scope.result = ''
    $scope.details = ''
    $scope.options = {};

    $scope.form = {
        type: 'geocode',
        bounds: {
            SWLat: 49,
            SWLng: -97,
            NELat: 50,
            NELng: -96
        },
        country: 'ca',
        typesEnabled: false,
        boundsEnabled: false,
        componentEnabled: false,
        watchEnter: true
    }

    //watch form for changes
    $scope.watchForm = function () {
        return $scope.form
    };
    $scope.$watch($scope.watchForm, function () {
        $scope.checkForm()
    }, true);


    //set options from form selections
    $scope.checkForm = function () {

        $scope.options = {};

        $scope.options.watchEnter = $scope.form.watchEnter

        if ($scope.form.typesEnabled) {
            $scope.options.types = $scope.form.type
        }
        if ($scope.form.boundsEnabled) {

            var SW = new google.maps.LatLng($scope.form.bounds.SWLat, $scope.form.bounds.SWLng)
            var NE = new google.maps.LatLng($scope.form.bounds.NELat, $scope.form.bounds.NELng)
            var bounds = new google.maps.LatLngBounds(SW, NE);
            $scope.options.bounds = bounds

        }
        if ($scope.form.componentEnabled) {
            $scope.options.country = $scope.form.country
        }
    };

});
app.directive('ngAutocomplete', function () {
    return {
        require: 'ngModel',
        scope: {
            lat: '=',
            lng: '=',
            ngModel: '=',
            options: '=',
            details: '='
        },

        link: function (scope, element, attrs, controller) {

            //options for autocomplete
            var opts
            var watchEnter = false
                //convert options provided to opts
            var initOpts = function () {

                opts = {}
                if (scope.options) {

                    if (scope.options.watchEnter !== true) {
                        watchEnter = false
                    } else {
                        watchEnter = true
                    }

                    if (scope.options.types) {
                        opts.types = []
                        opts.types.push(scope.options.types)
                        scope.gPlace.setTypes(opts.types)
                    } else {
                        scope.gPlace.setTypes([])
                    }

                    if (scope.options.bounds) {
                        opts.bounds = scope.options.bounds
                        scope.gPlace.setBounds(opts.bounds)
                    } else {
                        scope.gPlace.setBounds(null)
                    }

                    if (scope.options.country) {
                        opts.componentRestrictions = {
                            country: scope.options.country
                        }
                        scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
                    } else {
                        scope.gPlace.setComponentRestrictions(null)
                    }
                }
            }

            if (scope.gPlace == undefined) {
                scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
            }
            google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                var result = scope.gPlace.getPlace();
                if (result.address_components !== undefined) {

                    scope.$apply(function () {

                        scope.details = result;
                        console.log(result.address_components);
                        console.log(result.geometry.location.lat());
                        console.log(result.geometry.location.lng());
                        scope.lat = result.geometry.location.lat();
                        scope.lng = result.geometry.location.lng()
                        console.log(scope.lat);
                        console.log(scope.lng);
                        //    scope.inForm.inLatitude  = result.geometry.location.lat();
                        //    scope.inForm.inLongitude  = result.geometry.location.lng();
                        controller.$setViewValue(element.val());
                    });
                } else {
                    if (watchEnter) {
                        getPlace(result)
                    }
                }
            })

            //function to get retrieve the autocompletes first result using the AutocompleteService 
            var getPlace = function (result) {
                var autocompleteService = new google.maps.places.AutocompleteService();
                if (result.name.length > 0) {
                    autocompleteService.getPlacePredictions({
                            input: result.name,
                            offset: result.name.length
                        },
                        function listentoresult(list, status) {
                            if (list == null || list.length == 0) {

                                scope.$apply(function () {
                                    scope.details = null;
                                });

                            } else {
                                var placesService = new google.maps.places.PlacesService(element[0]);
                                placesService.getDetails({
                                        'reference': list[0].reference
                                    },
                                    function detailsresult(detailsResult, placesServiceStatus) {

                                        if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                                            scope.$apply(function () {

                                                controller.$setViewValue(detailsResult.formatted_address);
                                                element.val(detailsResult.formatted_address);

                                                scope.details = detailsResult;

                                                //on focusout the value reverts, need to set it again.
                                                var watchFocusOut = element.on('focusout', function (event) {
                                                    element.val(detailsResult.formatted_address);
                                                    element.unbind('focusout')
                                                })

                                            });
                                        }
                                    }
                                );
                            }
                        });
                }
            }

            controller.$render = function () {
                var location = controller.$viewValue;
                element.val(location);
            };

            //watch options provided to directive
            scope.watchOptions = function () {
                return scope.options
            };
            scope.$watch(scope.watchOptions, function () {
                initOpts()
            }, true);

        }
    };
});
app.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
app.controller('customersCrtl', ["$scope", "$http", "$timeout", "geolocation", function ($scope, $http, $timeout, geolocation) {
    //$scope.language_local = "cmn-Hant-TW";
    $scope.markers = init_markers;
    $scope.map = init_map;
    $scope.formdata = new Object();
    $scope.formdata.lat_local = 34.042940;
    $scope.formdata.long_local = -118.266904;
    $scope.formdata.asr_results = "All";
    //    $scope.formdata.language_local = "cmn-Hant-TW";
    $scope.formdata.reco_language = $scope.formdata.language_local;
    $scope.formdata.gps_bool = false;
    $scope.formdata.category_id = 1;


    $scope.inForm = new Object();
    $scope.inForm.inSID = '';
    $scope.inForm.inName = '';
    $scope.inForm.inCh_Name = '';
    $scope.inForm.inLocation = '';
    $scope.inForm.inCity = '';
    $scope.inForm.inState = '';
    $scope.inForm.inLat = 1.0;
    $scope.inForm.inLng = 1.0;
    $scope.inForm.inBizID = '';
    $scope.inForm.inRating = '';
    $scope.inForm.inSearch_Icon = '';
    $scope.inForm.inAddedBy = '';
    $scope.inForm.inModifiedBy = '';
    $scope.inForm.inAddedDate = '2015-08-22';
    $scope.inForm.inModifiedDate = '2015-08-22';
    $scope.inForm.inComments = '';
    $scope.inForm.inRetMsg = '';
    $scope.inForm.inCategory = '';
    $scope.inForm.inLanguage = 'en-US';
    $scope.inForm.details = new Object();




    //console.log($scope.formdata);
    /*
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    */
    $scope.filter = function () {
        $timeout(function () {
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.sort_by = function (predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

    $scope.loadData = function () {
        $http.post('ajax/getCustomers1.php', JSON.stringify($scope.formdata)).success(function (data) {
            console.log('typeofdata ' + typeof (data));
            $scope.list = data;
            $scope.markers = init_markers;
            $scope.map = init_map;
            $scope.currentPage = 1; //current page
            $scope.entryLimit = 50; //max no of items to display in a page
            $scope.filteredItems = $scope.list.length; //Initially for no filter  
            $scope.totalItems = $scope.list.length;
            $scope.initLoad = 0;
            resultMap($scope.list, $scope.formdata.gps_bool, $scope.formdata.lat_local, $scope.formdata.long_local, $scope.formdata.language_local, $scope.markers, $scope.map);
        });
    };

    $scope.addStore = function () {
        console.log('details=' + $scope.details);
        console.log('inForm.inName.length = ' + $scope.inForm.inName.length);
        $scope.inForm.inLanguage = $scope.formdata.language_local;
        if ($scope.inForm.inCh_Name.length == 0) {
            $scope.inForm.inCh_Name = $scope.inForm.inName
        };
        $http.post('ajax/addStore.php', JSON.stringify($scope.inForm)).success(function (data) {
            console.log('type of data= ' + typeof (data));
            console.log('data= ' + data);
            console.log('data= ' + $scope.inForm.retMsg);
            //            $scope.inForm = {};
            $scope.inForm.retMsg = data[0].retMsg;

        });
    };

    $scope.resetStore = function () {
        $scope.inForm.inName = '';
        $scope.inForm.inCh_Name = '';
        $scope.inForm.inLocation = '';
        $scope.inForm.inRating = '';
        $scope.inForm.inComments = '';
        $scope.inForm.inRetMsg = '';
        $scope.inForm.inCategory = '';
    };
    /*

        $scope.langchange = function(language) {
            if (language == 'en-US') {
                $('#jumbo-greeting').text('Find the best Chinese food in the San Gabriel Valley!');
                $('#jumbo-instructions').text('Select one of the categories below');
                $('#schezwan_title').text(cusine_types_en[0]);
                $('#schezwan_des').text("Cuisine from midwest China, known for its spiciness");
                $('#schezwan_dish').text("Popular Dishes: Kung Pao Chicken, Mabo Tofu");
                $('#taiwan_title').text(cusine_types_en[1]);
                $('#taiwan_des').text("Famous street food from Taiwan night markets");
                $('#taiwan_dish').text("Popular Dishes: Oyster Omelettes, Gua Bao");
                $('#beijing_title').text(cusine_types_en[2]);
                $('#beijing_des').text("Food from northern China, known for their soups and baked goods");
                $('#beijing_dish').text("Popular Dishes: Peking Duck");
                $('#canto_title').text(cusine_types_en[3]);
                $('#canto_des').text("Steamed dishes from southern China, popularized by Dim Sum");
                $('#canto_dish').text("Popular Dishes: Shumai, Suckling Pig");
            } else {
                $('#jumbo-greeting').text('尋找在 San Gabriel Valley 最好吃的中國菜!');
                $('#jumbo-instructions').text('請點選下列仼一菜式');
                $('#schezwan_title').text(cusine_types_ch[0]);
                $('#schezwan_des').text("口味特色: 麻辣, 爽口夠勁");
                $('#schezwan_dish').text("名菜: 宮保雞丁, 麻婆豆腐");
                $('#taiwan_title').text(cusine_types_ch[1]);
                $('#taiwan_des').text("口味特色: 煎炒, 多元豐富");
                $('#taiwan_dish').text("名菜: 蚵仔煎, 割包");
                $('#beijing_title').text(cusine_types_ch[2]);
                $('#beijing_des').text("口味特色: 燉烤, 量足味濃");
                $('#beijing_dish').text("名菜: 北京烤鴨");
                $('#canto_title').text(cusine_types_ch[3]);
                $('#canto_des').text("口味特色: 煨煲, 鮮美滋補");
                $('#canto_dish').text("名菜: 燒賣, 烤乳豬");
            }
        };

    */
    $scope.mouseenter = function (divid, language) {
        $scope.markers = init_markers;
        for (var i = 0; i < $scope.markers.length; i++) {
            if ($scope.markers[i].id == divid) {
                if (language == 'cmn-Hant-TW') {
                    google.maps.event.trigger($scope.markers[i], 'mouseover')
                } else {
                    google.maps.event.trigger($scope.markers[i], 'mouseover');
                }
            }
        };
    };

    $scope.mouseexit = function () {
        $scope.markers = init_markers;
        google.maps.event.trigger($scope.markers[0], 'mouseout');
    };

    //    $scope.loadData();
    geolocation.getLocation().then(function (geo) {
        $scope.coords = {
            lat: geo.coords.latitude,
            lon: geo.coords.longitude
        };
        var distcalc;
        distcalc = distance($scope.coords.lat, $scope.coords.lon, $scope.formdata.lat_local, $scope.formdata.long_local);
        //console.log('Initial Lat: ' + $scope.coords.lat);
        //console.log('Initial Long: ' + $scope.coords.long);
        //console.log('GPS Lat: ' + $scope.formdata.lat_local);
        //console.log('GPS Long: ' + $scope.formdata.long_local);
        //console.log("Distance Calc: " + distcalc);
        $scope.formdata.lat_local = $scope.coords.lat;
        $scope.formdata.long_local = $scope.coords.lon;

        if (distcalc < 50) {
            $scope.formdata.gps_bool = true;
        }
        $scope.loadData();
    });
}]);

app.directive('storeen', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: "app/table_en3.html"
    }
});

app.directive('storech', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: "app/table_ch3.html"
    }
});

//Google map stuff
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see a blank space instead of the map, this
// is probably because you have denied permission for location sharing.

//var map;

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    map.setCenter(options.position);
    //console.log(options);
}
// resultMap
function resultMap(list, gps_bool, lat_gps, lon_gps, language, inits_markers, inits_map) {

    var map = new google.maps.Map(document.getElementById('map_result'), {
        zoom: 10,
        center: new google.maps.LatLng(list[0].Latitude, list[0].Longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    //google.maps.event.trigger(map, 'resize');
    var infowindow = new google.maps.InfoWindow();
    var markers = [];
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < list.length; i++) {
        markers[i] = new google.maps.Marker({
            position: new google.maps.LatLng(list[i].Latitude, list[i].Longitude),
            icon: "img/Default_wb.png",
            map: map,
            id: list[i].SID,
            Name: list[i].Name,
            animation: google.maps.Animation.DROP

        });


        google.maps.event.addListener(markers[i], 'mouseover', (function (marker, j) {
            return function () {
                if (language == 'cmn-Hant-TW') {
                    infowindow.setContent(list[j].Ch_Name);
                } else {
                    infowindow.setContent(list[j].Name);
                }

                infowindow.open(map, marker);
            }
        })(markers[i], i));

        google.maps.event.addListener(markers[i], 'mouseout', (function () {
            return function () {
                infowindow.close();
            }
        })(markers[i], i));

        bounds.extend(markers[i].getPosition());

        var id_table = "$('#" + list[i].SID + "')";
    }
    init_markers = markers;
    inits_markers = markers;
    init_map = map;

    map.setCenter(new google.maps.LatLng(list[0].Latitude, list[0].Longitude));
    map.fitBounds(bounds);
    if (map.getZoom() > 15) {
        map.setZoom(15);
    };

    if (gps_bool == true) {
        marker = new google.maps.Marker({
            icon: 'img/Green_wb.png',
            position: new google.maps.LatLng(lat_gps, lon_gps),
            map: map
        });

        markers.push(marker);
        bounds.extend(marker.getPosition());
        map.fitBounds(bounds);
        if (map.getZoom() > 15) {
            map.setZoom(15);
        };
    };

};

function stickyCalc() {
    var stickyTop = $('#search_results').offset().top;
    var navbar = $('.navbar-header').height();
    var stickyTop1 = $('#map_result').offset().top; // returns number 
    var stickyTotal = stickyTop - navbar - 2;
    var stickyWidth = $('#map_contain').width();
    var stickyBottom = $('.panel-default').offset().top;
    //console.log('StickyTop: '+ stickyTop);
    //console.log('StickyTotal: '+ stickyTotal);
    //console.log('StickyBottom: ' + stickyBottom);
    $('#map_result').css({
        width: stickyWidth
    });

    $("#map_test").affix({
        offset: {
            top: stickyTotal,
            bottom: function () {
                return (this.bottom = $('.panel-default').outerHeight(true))
            }

            //top: function(){$('#search_results').offset().top - $('.navbar-header').height() - 2;}
        }
    });
}

$(function () { // document ready
    stickyCalc();
});


$(window).resize(function () {
    $("#map_test").affix('checkPosition');
    stickyCalc();
});

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - $('.navbar-header').height()
        }, 750, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Calculate Distance
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist
}

// Collapse menu
$(document).on('click', '.navbar-collapse.in', function (e) {
    if ($(e.target).is('a') && ($(e.target).attr('class') != 'dropdown-toggle')) {
        $(this).collapse('hide');
    }

});

$(".lng-sel").click(
    function (event) {
        event.preventDefault();
    }
);