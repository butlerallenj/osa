import React from 'react';
import ReactDOM from 'react-dom';


var config = {
	gamertag: 'AnthraxRainbow',
	platform: 'xbl',
	gamemode: 'competitive',
	summary: 'game_stats',
};

class Stat extends React.Component {
	
	render() {
		return (
			<div key={this.props.stat.title} className="stat-pane-card">
				<h2>{this.props.stat.title}</h2>
				<h1>{
						this.props.stat.filter === 'time' ? 
							((Math.round(this.props.stat.stat * 100)/100) * 60).toFixed(2) : 
							this.props.stat.stat
					} <span>
						{this.props.stat.suffix}
					</span>
				</h1>
			</div>
		);
	}
}

class StatCard extends React.Component {
	
	render() {
		let summary = this.props.summary.split('_').join(' ');
		return (
			<div className="stat-pane-card title" >
				<h1>{summary}</h1>
			</div>
		)
	}
}

class GamemodeLink extends React.Component {
	handleClick = (e) => {
		this.props.changeGamemode(this.props.value);
	}
	render() {
		return (
			<a className={this.props.active ? "active" : ""} onClick={this.handleClick}>{this.props.title}</a>
		)	
	}
}

class Profile extends React.Component {
	
	
	render() {
		var profileStyle = {
			backgroundImage: "url(" + this.props.stats.avatar + ")",
			backgroundSize: "cover"
		};
		
		return (
			<div className="profile">
				<div className="profile-picture" style={profileStyle}></div>
				<div className="profile-tag">
					<div className="profile-portrait" onClick={this.props.videoToggle}>
						<img alt="Rank" src={this.props.stats.rank_image} />
						<span className="profile-portrait-level">
							{this.props.stats.level}
						</span>
					</div>
					<h2>{config.gamertag}</h2>
					<h3><span className="key">Tier:</span> {this.props.stats.tier} <img id="tier" src={"//localhost/images/ranks/" + this.props.stats.tier} /></h3>
					<h3><span className="key">Wins/Losses:</span> {this.props.stats.wins}/{this.props.stats.losses}</h3>
					<h3><span className="key">Prestige:</span> {this.props.stats.prestige}</h3>
				</div>
				<div className="profile-button-bar">
				<ul>
					<li>
						<GamemodeLink title="Competitive" value="0" active={this.props.index == 0} changeGamemode={this.props.changeGamemode} />
						<GamemodeLink title="Quick Play" active={this.props.index == 1} value="1" changeGamemode={this.props.changeGamemode} />
					</li>
				</ul>
			</div>
			</div>
		)
	}
}

class Video extends React.Component {
	render() {
		return (
			<video className={this.props.className} src={this.props.src} muted autoPlay onEnded={this.props.onEnded}></video>
		)
	}
}

class Body extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			stats: [],
			videoIndex: 0,
			videoClass: "blur",
			gamemode: [
				"competitive",
				"quickplay"
			],
			gamemodeIndex: 0
		}
	}
	getStats = (e) => {
		fetch("//localhost/overwatch/" + config.platform + "/" + config.gamertag)
			.then((r) => r.json()
				.then((data) => { 
					const stats = data;
					this.setState({stats});
				})
			); 
	}
	
	getVideos = (e) => {
		fetch("//localhost/video/" + config.gamertag)
		.then((r) => r.json()
			.then((data) => { 
				const videos = data;
				this.setState({videos});
			})
		);
	}
	
	changeGamemode = (index) => {
		console.log(index);
		this.setState({
			gamemodeIndex: index
		})
	}
	
	changeBackgroundVideo = (e) => {
		console.log("Working");
		if(this.state.videoIndex < this.state.videos.length - 1) {
			this.setState({
				videoIndex: this.state.videoIndex + 1
			});
			console.log("VideoIndex Increment")
		} else { 
			this.setState({
				videoIndex: 0
			})
			this.getStats();
			this.getVideos();
			console.log("VideoIndex Decrement")
		}
		return true;
	}
	
	toggleVideoBlur = (e) => {
		if(!this.state.videoClass) {
			this.setState({
				videoClass: "blur",
			})
		} else {
			this.setState({
				videoClass: false
			})
		}
	}
	
	componentDidMount() {
		this.getStats();
		
	}
	
	componentWillMount() {
		this.getVideos();
	}
	
	render() {
		if(this.state.stats.length === 0) return false;
		
		var rows = [];
		
		Object.keys(
			this.state.stats[
				this.state.gamemode[
							this.state.gamemodeIndex
						]
			][config.summary]
		).map((key) => {
			
			let value = this.state.stats[
				this.state.gamemode[
					this.state.gamemodeIndex
				]
			][config.summary][key];

			rows.push(<Stat key={key} stat={value} />);

			return true;
		});
		
		if(this.state.videoClass) {
			var StatCards = (
				<div className="stat-pane-slide">
					<StatCard summary={config.summary} />
					{rows}
				</div>
			)
		} else {
			var StatCards = "";
		}
		
		return (
			<div id="main">
				<Profile 
					changeGamemode={this.changeGamemode} 
					index={this.state.gamemodeIndex}
					videoToggle={this.toggleVideoBlur} 
					stats={this.state.stats.all.stats[
						this.state.gamemode[
							this.state.gamemodeIndex
						]
					].overall_stats} />
				<div className="stat-pane">
					<div className="stat-pane-overlay"></div>
					<div className="stat-pane-slide">
						<Video className={this.state.videoClass} src={this.state.videos[this.state.videoIndex]} onEnded={this.changeBackgroundVideo} />
					</div>
					{StatCards}
				</div>
			</div>
		);
	}
}

ReactDOM.render(<Body />, document.getElementById('root'));