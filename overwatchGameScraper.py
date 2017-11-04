from bs4 import BeautifulSoup
import requests


def pullOverwatchVideo(GAMERTAG):
	DOMAIN = 'http://xboxdvr.com'
	URL = DOMAIN + '/gamer/'+ GAMERTAG +'/videos'
	
	r = requests.get(URL)
	html = r.text

	soup = BeautifulSoup(html, 'html.parser')
	a = soup.find_all('div', {'class': 'vid-card'})
	
	clips = []
	i = 0
	
	for vidcard in a:
		if 'Overwatch' in vidcard.find_all('div', {'class':'top-row'})[0].a.text:
			NEXTPAGE = vidcard.find_all('div', {'class':'content-row'})[0].find('a')['href']
			
			r = requests.get(DOMAIN+NEXTPAGE)
			html = r.text

			cup = BeautifulSoup(html, 'html.parser')
			VIDEO = cup.find('a', {'aria-labeledby':'#itemlabel5'})['href']

			clips.append(VIDEO)
			i += 1
			if i > 10:
				break
		else:
			continue
			
	return list(set(clips))

if __name__ == '__main__':
	import sys
	GAMERTAG = sys.argv[1]
	print(pullOverwatchVideo(GAMERTAG))