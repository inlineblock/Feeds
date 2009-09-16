Feeds.GoogleManager  = Class.create({
	Service: 'reader',
	Source: 'Palm Pre',
	
	SID: false,
	email: false,
	password: false,
	
	feeds: [],
	
	initialize: function()
	{
		this.sidHandler = new Mojo.Model.Cookie('google-auth-SID');
		this.feeds = [];
	},
	
	getRequestHeaders: function()
	{
		return {'Cookie': 'SID=' + this.SID};
	},
	
	setLogin: function(email , password)
	{
		this.email = email;
		this.password = password;
	},
	
	setSID: function(sid)
	{
		this.SID = sid;
	},
	
	login: function(email , password , callBack)
	{
		this.email = email;
		this.password = password;
		var callBack = callBack || Mojo.doNothing;
		
		if (this.initSID())
		{
			return callBack(true);
		}
		
		var params = {method: 'post' , onSuccess: this.loginSuccess.bind(this , callBack) , onFailure: this.loginFailure.bind(this , callBack)};
		params.parameters = {service: this.Service , Email: email , Passwd: password , source: this.Source};
		this.ajaxRequest = new Ajax.Request('https://www.google.com/accounts/ClientLogin' , params);
	},
	
	loginSuccess: function(callBack , t)
	{
		if (t.status != 200 || t.responseText.indexOf('SID=') == -1) return this.loginFailure(callBack , {});
		var start = t.responseText.indexOf('SID=') + 4;
		var end = t.responseText.indexOf('LSID=') - 5;
		var sid = t.responseText.substr(start , end);
		this.setSID(sid);
		this.storeSID(sid);
		callBack(true);
	},
	
	loginFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	getAllFeedsList: function(callBack)
	{
		if (!this.SID) return this.login(this.email , this.password , this.getFeedsList.bind(this));
		var callBack = callBack || Mojo.doNothing;
		var params = {method: 'get' , onSuccess: this.getFeedsSuccess.bind(this , callBack) , onFailure: this.getFeedsFailure.bind(this , callBack)};
		//http://www.google.com/reader/api/0/subscription/list?output=json&ck=1252820241278&client=scroll&hl=en
		params.parameters = { output: 'json' };
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request('http://www.google.com/reader/api/0/subscription/list' , params);
	},
	
	getFeedsSuccess: function(callBack , t)
	{
		if (t.status != 200) return this.getFeedsFailure();
		try
		{
			var feeds = t.responseText.evalJSON().subscriptions;
			for(var i=0; i < feeds.length; i++)
			{
				var feed = new Feeds.GoogleFeed(this);
				feed.load(feeds[i]);
				this.feeds.push(feed);
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
			this.getFeedsFailure();
		}
	},
	
	getFeedsFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	updateUnreadCount: function(callBack)
	{
		var callBack = callBack || Mojo.doNothing;
		var params = {method: 'get' , onSuccess: this.updateUnreadSuccess.bind(this , callBack) , onFailure: this.updateUnreadFailure.bind(this , callBack)};
		//http://www.google.com/reader/api/0/unread-count?allcomments=true&output=json&ck=1252818277109&client=scroll&hl=en
		params.parameters = { allcomments: 'true' , output: 'json' };
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request('http://www.google.com/reader/api/0/unread-count' , params);
	},
	
	updateUnreadSuccess: function(callBack , t)
	{
		if (t.status != 200) return this.updateUnreadFailure(callBack);
		
		try
		{
			var counts = t.responseText.evalJSON().unreadcounts;
			if (counts.length)
			{
				for (var i=0; i < this.feeds.length; i++)
				{
					for (var j=0; j < counts.length; j++)
					{
						if (counts[j] && this.feeds[i].id == counts[j].id)
						{
							this.feeds[i].setUnreadCount(counts[j].count);
							delete counts[j];
						}
					}
				}
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
			return this.updateUnreadFailure(callBack);
		}
		
	},
	
	updateUnreadFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	initSID: function()
	{
		var payload = this.sidHandler.get();
		if (!payload || !payload.SID || !payload.timeStamp) return false;
		if (payload.timeStamp - 1209600 > Delicious.getTimeStamp()) return false;
		
		Mojo.Log.info('PullingSID: ' , payload.SID);
		this.setSID(payload.SID);
		return true;
	},
	
	storeSID: function(sid)
	{
		Mojo.Log.info('StoringSID: ' , sid);
		var payload = {'SID': sid , 'timeStamp': Delicious.getTimeStamp() };
		this.sidHandler.put(payload);
	},
	
	removeSID: function()
	{
		this.sidHandler.put(false);
	},
	
	getLastEditToken: function()
	{
		if (!this.editToken) return false;
		
		this.editToken = this.editToken || {};
		var lastTime = this.editToken.timeStamp;
		
		var dateTime = Delicious.getTimeStamp();
		
		if (time - 180 > lastTime)
		{
			this.editToken = false;
			return false;
		}
		else
		{
			return this.editToken.token;
		}
	},
	
	setEditToken: function(token)
	{
		this.editToken = {'token': token , 'timeStamp': Delicious.getTimeStamp() };
	},
	
	getEditToken: function(callBack)
	{
		var callBack = callBack || Mojo.doNothing;
		var token = this.getLastEditToken();
		if (!token)
		{
			var params = {method:'get' , onSuccess: this.getEditTokenSuccess.bind(this , callBack)};
			this.getToken = new Ajax.Request('http://www.google.com/reader/api/0/token' , params);
		}
		else
		{
			callBack(token);
		}
	},
	
	getEditTokenSuccess: function(callBack , t)
	{
		var callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return;
		callBack(t.responseText);
	}

});