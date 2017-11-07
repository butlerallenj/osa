//setTimeout(function () {
//	location.reload();
//}, 30000);
var GOOGLE_API_KEY = "AIzaSyCArZE_WQ6RVoTAV5tMqVTHbOnE8KpZ58Q",
	GAMEMODE = 'competitive',
	app = angular.module('owstats', ['video-background']);

function randomInt(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

app.controller('mainController', function ($scope, $http) {
	$scope.gamertag = '';
	$scope.tier_data_img_src = {
		bronze: "rank-1.png",
		silver: "rank-2.png",
		gold: "rank-3.png",
		platinum: "rank-4.png",
		diamond: "rank-5.png",
		master: "rank-6.png",
		grandmaster: "rank-7.png"
	}
	$scope.pullGameClips = function() {
		$http({
			method: 'GET',
			url: '/video/'+$scope.gamertag,
		}).then(function(r) {
			$scope.clipIndex = 0;
			$scope.gameClips = r.data;
			document.getElementById('video').playbackRate= 0.5
			$scope.backgroundClip = {
				mp4: $scope.gameClips[$scope.clipIndex]
			}
		});	
	}
	
	$scope.blur = 'blur'
	$scope.viewVideo = function() {
		if($scope.blur) {
			$scope.blur = false;
		} else {
			$scope.blur = 'blur';
		}
	}

	$scope.changeClip = function() {
		$scope.clipIndex++;
		console.log("changing clip: ", $scope.clipIndex, " Out of ", $scope.gameClips.length);

		
		if($scope.clipIndex > $scope.gameClips.length) {
			$scope.clipIndex = 0;
		}
		
		$scope.backgroundClip.mp4 = $scope.gameClips[$scope.clipIndex];
		console.log('Clip changed to: ', $scope.backgroundClip.mp4)
	};
	
	$scope.GAMEMODE = GAMEMODE;
	
	$scope.changeMode = function(mode) {
		$scope.GAMEMODE = mode;
	};
	$scope.displayStatistics = {
		competitive: {},
		quickplay: {}
	};
	$scope.StatsMapping = function() {
		return {
			average_stats: {
				title: "Average Stats",
				damage_done_avg: {
					title: "Damage Done",
				},
				deaths_avg: {
					title: "Deaths",
				},
				eliminations_avg: {
					title: "Eliminations",
				},
				final_blows_avg: {
					title: "Final Blows",
				},
				objective_time_avg: {
					title: "Objective Time",
					filter: function(time) {
						return (Math.round(time * 100)/100) * 60
					},
					suffix: "minutes"
				}, 
				solo_kills_avg: {
					title: "Solo Kills",
				},
				time_spent_on_fire_avg: {
					title: "Time on Fire",
					filter: function(time) {
						return (Math.round(time * 100)/100) * 60
					},
					suffix: "minutes"
				}
			},
			game_stats: {
				title: "Game Stats",
				games_won: {
					title: "Games Won",
				},
				eliminations: {
					title: "Eliminations",
				},
				kpd: {
					title: "Kills per Death",
				},
				multikill_best: {
					title: "Best Multikill",
				},
				solo_kills_most_in_game: {
					title: "Most Solo Kills",
				},
				kill_streak_best: {
					title: "Best Killstreak",
				},
				time_played: {
					title: "Time Played",
					suffix: "Hours"
				}
			}
		}
	}; 
	
	$scope.stat_summaries = Object.keys($scope.StatsMapping());
	
	$scope.stat_summary_index = 0;
	
	$scope.current_stat_summary = $scope.StatsMapping()[$scope.stat_summaries[$scope.stat_summary_index]].title;
	
	$scope.changeStatSummary = function() {
		
		$scope.stat_summary_index += 1;
		
		if($scope.stat_summary_index >= $scope.stat_summaries.length) {
			
			$scope.stat_summary_index = 0;
		}
		
		$scope.current_stat_summary = $scope.displayStatistics[GAMEMODE][$scope.stat_summaries[$scope.stat_summary_index]].title;
	}
	
	$scope.pullCustomImage = function() {
		$http({
				method: 'GET',
				url: 'https://www.googleapis.com/customsearch/v1',
				params: {
					q: "overwatch fan art " + $scope.hero,
					cx: "006768814514772087364:zvc9umuh7p0",
					searchType: 'image',
					key: GOOGLE_API_KEY
				}
			}).then(function(r) {
				console.log(r.data);
				
				$scope.backgroundImage = r.data.items[randomInt(0, r.data.items.length)].link.split('?')[0];
				
				while ($scope.backgroundImage.indexOf('logo') > -1) {
					$scope.backgroundImage = r.data.items[randomInt(0, r.data.items.length)].link.split('?')[0];
				}
			}, function(e) {
				$scope.backgroundImage = "http://i.imgur.com/XRoDB8W.jpg";
			});
	};
	$scope.stats = {
		competitive: null,
		quickplay: null,
		heroes: null
	};
	
	$scope.calculateHero = function() {
		var Heroes = Object.keys($scope.stats.heroes),
			length = Heroes.length,
			best = 0;
			

		for(var i = 0; i < length; i++) {
			var hero = $scope.stats.heroes.playtime[$scope.GAMEMODE][Heroes[i]];

			if (hero > best) {
				best = hero;
				$scope.hero = Heroes[i];
			}

		}
	};
	$scope.pullStats = function() {
		$http({
			method: 'GET',
			url: 'https://owapi.net/api/v3/u/' + $scope.gamertag + '/blob',
			params: {
				platform: 'xbl'
			}
		}).then(function (r) {
			console.log(r.data);
			$scope.stats.competitive = r.data.any.stats.competitive;
			$scope.stats.quickplay = r.data.any.stats.quickplay;
			$scope.stats.heroes = r.data.any.heroes;
			$scope.calculateHero();
			
			for (var i = 0, modes = Object.keys($scope.displayStatistics); i < modes.length; i++) {
				var mode = modes[i];
				for (var a = 0, keys = Object.keys($scope.StatsMapping()); a < keys.length; a++) {
					var key = keys[a],
						value = $scope.StatsMapping()[key];
					
					$scope.displayStatistics[mode][key] = value;
					$scope.displayStatistics[mode][key].title = key.split('_').join(' ');

					for (var b = 0, values = Object.keys(value); b < values.length; b++) {
						
						var k = values[b],
							v = value[k],
							stat = r.data.any.stats[mode][key][k];
						
						$scope.displayStatistics[mode][key][k] = v;
						
						if(v.filter) {
							$scope.displayStatistics[mode][key][k].stat = v.filter(stat);

						} else {

							$scope.displayStatistics[mode][key][k].stat = stat;

						}
					}
				}
				
			}; 
			
			
			
			
			
		}, function(e) { $scope.pullStats() });
	};
	$scope.pullStats();
	$scope.round = function (num) {
		return Math.round(num);
	};

	
	window.setInterval(function () {
		$scope.pullStats();
	}, 1000 * 600);
});

app.directive('backImg', function(){
	// Found at: http://stackoverflow.com/questions/13781685/angularjs-ng-src-equivalent-for-background-imageurl
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            element.css({
                'background-image': 'url(' + value +')',
                'background-size' : 'cover'
            });
        });
    };
});

app.directive('onVideoEnd', function($parse) {
	return {
		restrict: 'A',
		link: function (scope, elem, attr) {
			var func = $parse(attr.onVideoEnd);
			scope.$watch(attr.onVideoEnd, function() {
				elem[0].onended = function() {
					scope.changeClip();
					func();
					return scope.$apply(scope.changeClip());
				}
			});
		}
	}
});
app.filter("trustUrl", ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }]);