Feeds.GoogleManager  = Class.create({
	Service: 'reader',
	Source: 'Palm Pre',
	
	SID: false,
	email: false,
	password: false,
	
	feeds: [],
	folders: {},
	display: [],
	
	allItemsFeed: false,
	
	initialize: function()
	{
		this.sidHandler = new Mojo.Model.Cookie('google-auth-SID');
		this.feeds = [];
		this.display = [];
		this.folders = {};
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
		if (t.status != 200 || t.responseText.indexOf('SID=') == -1) return this.loginFailure(callBack);
		var start = t.responseText.indexOf('SID=') + 4;
		var end = t.responseText.indexOf('LSID=') - 5;
		var sid = t.responseText.substr(start , end);
		this.setSID(sid);
		this.storeSID(sid);
		callBack(true);
	},
	
	loginFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing();
		callBack(false);
	},
	
	getAllFeedsList: function(callBack)
	{
		if (!this.SID) return this.login(this.email , this.password , this.getFeedsList.bind(this));
		var callBack = callBack || Mojo.doNothing;
		var params = {method: 'get' , onSuccess: this.getFeedsSuccess.bind(this , callBack) , onFailure: this.getFeedsFailure.bind(this , callBack)};
		params.parameters = { output: 'json' , ck: Delicious.getTimeStamp() , client: "PalmPre" };
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request('http://www.google.com/reader/api/0/subscription/list' , params);
	},
	
	getFeedsSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing();
		if (t.status != 200) return this.getFeedsFailure(callBack);
		try
		{
			this.setupAllItemsFeed();
			var feeds = t.responseText.evalJSON().subscriptions;
			for(var i=0; i < feeds.length; i++)
			{
				var feed = new Feeds.GoogleFeed(this);
				feed.load(feeds[i]);
				this.feeds.push(feed);
				this.addFeedToCategories(feed);
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error('+++++++getFeedsSuccess' , Object.toJSON(e));
			this.getFeedsFailure(callBack);
		}
	},
	
	getFeedsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing();
		callBack(false);
	},
	
	updateUnreadCount: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		var params = {method: 'get' , onSuccess: this.updateUnreadCountSuccess.bind(this , callBack) , onFailure: this.updateUnreadCountFailure.bind(this , callBack)};
		//http://www.google.com/reader/api/0/unread-count?allcomments=true&output=json&ck=1252818277109&client=scroll&hl=en
		params.parameters = { allcomments: 'true' , output: 'json' , ck: Delicious.getTimeStamp() , client: "PalmPre" };
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request('http://www.google.com/reader/api/0/unread-count' , params);
	},
	
	updateUnreadCountSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return this.updateUnreadCountFailure(callBack);
		try
		{
			var counts = t.responseText.evalJSON().unreadcounts;
			if (counts.length)
			{
				for (var i=0; i < this.feeds.length; i++)
				{
					for (var j=0; j < counts.length; j++)
					{
						if (counts[j] && this.feeds[i].id == counts[j].id && this.feeds[i])
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
			return this.updateUnreadCountFailure(callBack);
		}
		
	},
	
	updateUnreadCountFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false);
	},
	
	initSID: function()
	{
		var payload = this.sidHandler.get();
		if (!payload || !payload.SID || !payload.timeStamp) return false;
		if (payload.timeStamp - 1209600 > Delicious.getTimeStamp()) return false;
		
		//Mojo.Log.info('PullingSID: ' , payload.SID);
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
			var params = {method:'get' , onSuccess: this.getEditTokenSuccess.bind(this , callBack) , onFailure: this.getEditTokenFailure.bind(this , callBack)};
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
		if (t.status != 200) this.getEditTokenFailure(callBack);
		//this.setEditToken(t.responseText);
		callBack(t.responseText);
	},
	
	getEditTokenFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	addFeedToCategories: function(feed)
	{
		try
		{
			var categories = feed.categories;
			if (!categories || !categories.length)
			{
				this.display.push(feed);
				return;
			}
			
			for (var i=0; i < categories.length; i++)
			{
				var cat = categories[i];
				if (cat.id && cat.label)
				{
					if (this.folders[cat.id])
					{
						this.folders[cat.id].addFeed(feed);
					}
					else
					{
						this.folders[cat.id] = new Feeds.GoogleFolder(cat);
						this.folders[cat.id].addFeed(feed);
						this.display.push(this.folders[cat.id]);
					}
				}
			}
		}
		catch(e)
		{
			Mojo.Log.error('Feeds.GoogleManager :: addFeedToCategories: ' , Object.toJSON(e));
		}
	},
	
	getDisplayItems: function()
	{
		try
		{
			this.updateAllFoldersCount();
			this.updateAllItemsFeed();
		}
		catch(e)
		{
			Mojo.Log.error('+++++++getDisplayItems' , Object.toJSON(e));
		}
		
		return this.display;
	},
	
	setupAllItemsFeed: function()
	{
		if (this.display.length == 0)
		{
			this.allItemsFeed = new Feeds.GooglePsuedoFeed(this);
			this.allItemsFeed.load({});
			this.display.push(this.allItemsFeed);
		}
	},
	
	updateAllFeedsCount: function()
	{
		
	},
	
	updateAllFoldersCount: function()
	{
		var i;
		for(i in this.folders) if (this.folders.hasOwnProperty(i))
		{
			this.folders[i].refreshUnreadCount();
		}
	},
	
	updateAllItemsFeed: function()
	{
		if (this.allItemsFeed)
		{
			var count = 0;
			for(var i=0; i < this.feeds.length; i++)
			{
				count += this.feeds[i].unreadCount;
			}
			this.allItemsFeed.setUnreadCount(count);
		}
	},
	
	markAllAsRead: function(callBack , editToken)
	{
		callBack = callBack || Mojo.doNothing;
		editToken = editToken || false;
		
		if (!editToken)
		{
			this.getEditToken(this.markAllAsRead.bind(this , callBack));
			return;
		}
		
		var baseURL = "http://www.google.com/reader/api/0/mark-all-as-read?client=PalmPre";
		var params = {method: 'post' , onSuccess: this.markAllAsReadSuccess.bind(this , callBack) , onFailure: this.markAllAsReadFailure.bind(this , callBack)};
		params.parameters = {
			ts: Delicious.getTimeStamp(),
			s: "user/-/state/com.google/reading-list" ,
			t: "All items" ,
			T: editToken
		};
		params.requestHeaders = this.getRequestHeaders();
		
		this._ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	markAllAsReadSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return this.markAllAsReadFailure(callBack);
		this.blindMarkAllAsRead();
		return callBack(true);
	},
	
	markAllAsReadFailure: function(callBack ,t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false);
	},
	
	blindMarkAllAsRead: function()
	{
		if (this.feeds.length > 0)
		{
			for(var i=0; i < this.feeds.length; i++) if (this.feeds[i] && this.feeds[i].setUnreadCount)
			{
				this.feeds[i].setUnreadCount(0);
			}
		}
	}

});