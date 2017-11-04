import json
import requests
from flask import Flask, send_from_directory, Response
from flask_cors import CORS
from overwatchGameScraper import pullOverwatchVideo

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
	return send_from_directory('static', 'index.html')

@app.route('/images/ranks/<medal>')
def rank(medal):
	ranks = {
		"bronze": "rank-1.png",
		"silver": "rank-2.png",
		"gold": "rank-3.png",
		"platinum": "rank-4.png",
		"diamond": "rank-5.png",
		"master": "rank-6.png",
		"grandmaster": "rank-7.png"
	}
	try:
		return send_from_directory('static/images/ranks/', ranks[medal])
	except:
		return send_from_directory('static/images/ranks/', medal)
	
@app.route('/<path:path>')
def root(path):
	return send_from_directory('static', path)

@app.route('/video/<gamertag>')
def getVideo(gamertag):
	j = json.dumps(pullOverwatchVideo(gamertag))
	
	r = Response(j)
	r.headers['Content-Type'] = "application/json"
	
	return r

@app.route('/overwatch/<platform>/<gamertag>')
def stats(platform, gamertag):
	r = requests.get("https://owapi.net/api/v3/u/"+ gamertag + "/blob?platform=" + platform, headers={"User-Agent": "Overwatch Stats App v0.1"})
	
	
	mapping = {
		"game_stats": {
			"medals_gold": {
				"title": "Gold Medals",
			},
			"kpd": {
				"title": "Kills per Death",
			},
			"multikill_best": {
				"title": "Best Multikill",
			},
			"solo_kills_most_in_game": {
				"title": "Most Solo Kills",
			},
			"kill_streak_best": {
				"title": "Best Killstreak",
			},
			"time_played": {
				"title": "Time Played",
				"suffix": "Hours"
			}, 
			"eliminations": {
				"title": "Eliminations"	
			}
		}
	}
	
	gamemodes = [
		"competitive",
		"quickplay"
	]
	
	data = {}
	
	stats = r.json()
	
	for mode in gamemodes:	
		s = {}
		for title, obj in mapping.iteritems():
			s[title] = {}
			
			for k, v in obj.iteritems():
				s[title][k] = {}
				
				for key,value in v.iteritems():
					s[title][k][key] = value
				
				if k != 'title':
					s[title][k]['stat'] = stats['any']['stats'][mode][title][k]
		
		data[mode] = s
	
#	for mode, val in data.iteritems():
#		
#		for key, value in mapping.iteritems():
#			data[mode][key] = value;
#			
#			for k, v in value.iteritems():
#				print(mode, k, v)
#				data[mode][key][k] = v
#				
#				if k != 'title':
#					data[mode][key][k]['stat'] = stats['any']['stats'][mode][key][k]

	
					
	data["all"] = stats['any']
	
	j = json.dumps(data)
	r = Response(j)
	r.headers['Content-Type'] = "application/json"
	
	return r

if __name__ == '__main__':
	app.run('0.0.0.0', port=80, debug=True)
