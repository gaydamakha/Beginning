var Map = function() {
	var self = {
		width: 4000,
		height:4000,
		border:1000,
	}
	self.minX = self.border;
	self.minY = self.border;
	self.maxX = self.width - self.border;
	self.maxY = self.height - self.border;
	return self;
}

var Map=Map();

var Entity = function() {
	var self = {
		x:0,
		y:0,
		spdX:0,
		spdY:0,
		id:"",

	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x +=self.spdX;
		self.y +=self.spdY;
	}
	self.getDistance = function(object){
		return Math.sqrt(Math.pow(object.x-self.x,2)+Math.pow(object.y-self.y,2));
	}
	return self;
}

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};

var Player = function(socket){
	var self = Entity();
	self.size = {
		d:50,
		value:50,
		min:5
	}
	self.x = Tools.getRandomInt(Map.minX+self.size.d,Map.maxX-self.size.d);
	self.y = Tools.getRandomInt(Map.minY+self.size.d,Map.maxY-self.size.d);
	self.id = socket.id;
	self.name = socket.name;
	self.health = {
		d:100,
		value:100
	};
	self.live = true;

	self.score = 0;

	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack=false;
	self.mouseAngle=0;

	self.maxSpd = 13;
	self.boost = 0.5;



	self.color = Tools.generateColor();
	self.bulletColor = Tools.generateColor();
	
	var super_update = self.update;
	self.update = function(){
		if (self.live) {		
			self.updateSpd();
			super_update();

			if(self.pressingAttack){
				var b=Bullet(self.id);
				b.x=self.x;
				b.y=self.y;
				self.pressingAttack = false;
			}

		}
	}

	self.hit = function(parentId,damage){
		self.health.value-=damage;
		self.size.value=self.size.min+(self.health.value/100)*(self.size.d-self.size.min);
		if (self.health.value === 0) {

			self.live = false;

			Player.list[parentId].score++;

			//Player.onDisconnect(self.id);
			//var socket = SOCKET_LIST[self.id];
			socket.emit('restart');

			var msg = Player.list[parentId].name + ' убил ' + self.name;
			//log(msg);
			//Посмотреть события, передать msg в server.js, логгировать
		}
	}

	self.reCreate = function(){

		self.live = true;
		self.size.value = self.size.d;
		self.score = 0;
		self.health.value = self.health.d;
		self.x = Tools.getRandomInt(Map.minX+self.size.d,Map.maxX-self.size.d);
		self.y = Tools.getRandomInt(Map.minY+self.size.d,Map.maxY-self.size.d);

	}


	self.updateSpd = function() {
		self.maxSpd = (10+(3*((self.health.d-self.health.value)/self.health.d)));

		a=1;

		if (self.pressingRight && self.pressingUp)
			a=Math.pow(2,1/2)/2;
		else if (self.pressingRight && self.pressingDown) 
			a=Math.pow(2,1/2)/2;
		else if (self.pressingLeft && self.pressingUp)
			a=Math.pow(2,1/2)/2;
		else if (self.pressingLeft && self.pressingDown)
			a=Math.pow(2,1/2)/2;


		if (self.pressingRight){
			if (self.spdX < self.maxSpd*a) {
				self.spdX += self.boost;
			}else self.spdX	= self.maxSpd*a;		
		}			
		else if (self.pressingLeft){
			if (self.spdX > -self.maxSpd*a) {
				self.spdX -= self.boost;
			}else self.spdX	= -self.maxSpd*a;			
		}
		else{
			if (self.spdX>0) {
				self.spdX -= self.boost;
			}else if(self.spdX<0){
				self.spdX += self.boost;
			}
			if (Math.abs(self.spdX) <= (self.boost / 2)) {
				self.spdX = 0;
			}
		}

		if (self.pressingUp){
			if (self.spdY > -self.maxSpd*a) {
				self.spdY -= self.boost;
			}else self.spdY	= -self.maxSpd*a;				
		}
		else if (self.pressingDown){		
			if (self.spdY < self.maxSpd*a) {
				self.spdY += self.boost;
			}else self.spdY	= self.maxSpd*a;	
		}
		else{
			if (self.spdY>0) {
				self.spdY -= self.boost;
			}else if(self.spdY<0){
				self.spdY += self.boost;
			}
			if (Math.abs(self.spdY) <= (self.boost / 2)) {
				self.spdY = 0;
			}
		}

		if (self.x + self.size.value >= Map.maxX) {
			self.spdX = -1;
		}else if (self.x - self.size.value <= Map.minX) {
			self.spdX = +1;
		}

		if (self.y + self.size.value >= Map.maxY) {
			self.spdY = -1;
		}else if (self.y - self.size.value <= Map.minY) {
			self.spdY = +1;
		}
	};

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			size:self.size.value,	
			name:self.name,
			color:self.color,
			score:self.score,
			live:self.live,
		};		
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			size:self.size.value,
			score:self.score,
			live:self.live,
		}	
	}

	Player.list[socket.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};

Player.onConnect = function(socket){
	var player = Player(socket);
	socket.on('mousePosition',function(data){
		var x = data.x;
		var y = data.y; 
		player.mouseAngle = Math.atan2(y,x)/Math.PI * 180;
	})
	socket.on('keyPress',function(data){
		if (data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack=data.state;
	})
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
	socket.on('reCreate',function(){
		player.reCreate();
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}
Player.onDisconnect = function(id){
	delete Player.list[id];
	removePack.player.push(id);
}

Player.update = function(){
	var pack=[];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}

var Bullet = function(parentId){
	var self = Entity();
	self.id = Math.random();
	self.parentId = parentId;
	self.size = 8;
	self.maxSpd = 20;
	self.damage = 10;
	self.angle = Player.list[self.parentId].mouseAngle;
	self.spdX = Math.cos(self.angle/180*Math.PI) * self.maxSpd;
	self.spdY = Math.sin(self.angle/180*Math.PI) * self.maxSpd;
	self.color = Player.list[self.parentId].bulletColor;

	self.timer = 0;
	self.toRemove = false;

	var super_update=self.update;
	self.update=function(){

		if (self.timer++ > 100)	{
			self.toRemove = true;
		}

		super_update();

		for(var i in Player.list){
			var player = Player.list[i];
			var distance = self.getDistance(player);
			if (self.parentId !== player.id && distance<player.size.value+self.size) {
				player.hit(self.parentId,self.damage);
				self.toRemove=true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			color:self.color,
			size:self.size,		
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,		
		};
	}
	
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}

Bullet.list = {};

Bullet.update = function(){
	var pack=[];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		}
		else
			pack.push(bullet.getUpdatePack());
	}
	return pack;
}
Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}

var Tools = {
	generateColor: function(){
		return '#' + Math.floor(Math.random()*16777215).toString(16);
	},
	getRandomInt: function(min,max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};

module.exports = {
	PlayerOnConnect:Player.onConnect,
	PlayerOnDisconnect:Player.onDisconnect,
	PlayerUpdate:Player.update,
	BulletUpdate:Bullet.update,
	Map:Map,
	initPack:initPack,
	removePack:removePack
}
