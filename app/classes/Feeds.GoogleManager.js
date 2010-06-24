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
	
	depot: false,
	depotReady:false,
	depotError: false,
	
	allFeedsKey: 'Feeds::allFeeds',
	
	initialize: function()
	{
		this.offlineMode = false;
		this.sidHandler = new Mojo.Model.Cookie('google-auth-SID');
		this.feeds = [];
		this.display = [];
		this.folders = {};
		this.initializeDepot();
	},
	
	getRequestHeaders: function()
	{
		return {'Authorization': 'GoogleLogin auth=' + this.SID};
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
	
	login: function(email , password , callBack , force)
	{
		this.email = email;
		this.password = password;
		var callBack = callBack || Mojo.doNothing;
		force = force || false;
		
		if (!force && this.initSID())
		{
			return callBack(true);
		}
		
		var params = {method: 'post' , onSuccess: this.loginSuccess.bind(this , callBack) , onFailure: this.loginFailure.bind(this , callBack)};
		params.parameters = {service: this.Service , Email: email , Passwd: password , source: this.Source};
		this.ajaxRequest = new Ajax.Request('https://www.google.com/accounts/ClientLogin' , params);
	},
	
	loginSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200 || t.responseText.indexOf('SID=') == -1) return this.loginFailure(callBack);
		var parts = t.responseText.split("\n"), groups = {};
		if (!parts || parts.length < 1) return this.loginFailure(callBack);
		parts.each(function(p) {
			var g = p.split('=');
			groups[g[0]] = g[1];
		} , this);
		if (!groups.Auth) return this.loginFailure(callBack);
		this.setSID(groups.Auth);
		this.storeSID(groups.Auth);
		callBack(true);
	},
	
	loginFailure: function(callBack)
	{
		callBack = callBack || Mojo.doNothing();
		callBack(false);
	},
	
	getAllFeedsList: function(callBack)
	{
		Mojo.Log.info('++-+-+---getAllFeedsList');
		this.resetAllFeeds();
		if (this.offlineMode) return this.getFeedsFromDepot(callBack);
		
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
			this.setupStarredItemsFeed();
			var feeds = t.responseText.evalJSON().subscriptions;
			for(var i=0; i < feeds.length; i++)
			{
				var feed = new Feeds.GoogleFeed(this);
				feed.load(feeds[i]);
				this.feeds.push(feed);
				this.addFeedToCategories(feed);
			}
			callBack(true);
			window.setTimeout(this.addFeedsToDepot.bind(this) , 50);
		}
		catch(e)
		{
			Mojo.Log.error('+++++++getFeedsSuccessError' , Object.toJSON(e));
			this.getFeedsFailure(callBack);
		}
	},
	
	getFeedsFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing();
		callBack(false , (t.status || 0));
	},
	
	updateUnreadCount: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		
		if (this.offlineMode) return window.setTimeout(callBack.bind({} , true) , 20);
		
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
			this.blindMarkAllAsRead();
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
			window.setTimeout(this.addFeedsToDepot.bind(this) , 50);
		}
		catch(e)
		{
			Mojo.Log.error('------updateUnreadCountSuccessError' , Object.toJSON(e));
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
			params.requestHeaders = this.getRequestHeaders();
			this.getTokenAjax = new Ajax.Request('http://www.google.com/reader/api/0/token' , params);
		}
		else
		{
			callBack(token);
		}
	},
	
	getEditTokenSuccess: function(callBack , t)
	{
		var callBack = callBack || Mojo.doNothing;
		if (t.status != 200 || t.responseText.length < 3 ) this.getEditTokenFailure(callBack);
		//this.setEditToken(t.responseText);
		callBack(t.responseText);
	},
	
	getEditTokenFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(-1);
	},
	
	addFeedToCategories: function(feed , offlineMode)
	{
		offlineMode = offlineMode || false;
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
						this.folders[cat.id] = new Feeds.GoogleFolder(this , cat , offlineMode);
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
	
	getFeeds: function()
	{
		return this.feeds;
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
	
	setupStarredItemsFeed: function()
	{
		if (this.display.length <= 1)
		{
			this.starredFeed = new Feeds.GooglePsuedoFeed(this);
			this.starredFeed.load({title: 'Starred items' , id: 'user/-/state/com.google/starred' , className: 'starred'});
			this.display.push(this.starredFeed);
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
		if (editToken === -1) return callBack(false);
		var baseURL = "http://www.google.com/reader/api/0/mark-all-as-read?client=PalmPre";
		var params = {method: 'post' , onSuccess: this.markAllAsReadSuccess.bind(this , callBack) , onFailure: this.markAllAsReadFailure.bind(this , callBack)};
		params.parameters = {
			ts: Delicious.getTimeStamp(),
			s: "user/-/state/com.google/reading-list" ,
			t: "All items" ,
			T: editToken
		};
		params.requestHeaders = this.getRequestHeaders();
		
		this.ajaxRequest = new Ajax.Request(baseURL , params);
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
	},
	
	addFeed: function(url , callBack , editToken)
	{
		callBack = callBack || Mojo.doNothing;
		editToken = editToken || false;
		
		if (!editToken)
		{
			this.getEditToken(this.addFeed.bind(this , url , callBack));
			return;
		}
		
		if (editToken === -1) return callBack(false);
		
		var baseURL = "http://www.google.com/reader/api/0/subscription/quickadd?client=PalmPre";
		var params = {method: 'post' , onSuccess: this.addFeedSuccess.bind(this , callBack) , onFailure: this.addFeedFailure.bind(this , callBack)};
		params.parameters = {
			quickadd: url ,
			T: editToken
		};
		params.requestHeaders = this.getRequestHeaders();
		
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	addFeedSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return this.addFeedFailure(callBack);
		try
		{
			var d = t.responseText.evalJSON();
			if (d.streamId)
			{
				return callBack(true , d);
			}
			else
			{
				this.addFeedFailure(callBack);// should display probable stuff
			}
		}
		catch(e)
		{
			return this.addFeedFailure(callBack);
		}
		
	},
	
	addFeedFailure: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		
		callBack(false);
	},
	
	deleteFeed: function(feed , callBack , editToken)
	{
		callBack = callBack || Mojo.doNothing;
		editToken = editToken || false;
		
		if (!editToken)
		{
			this.getEditToken(this.deleteFeed.bind(this , feed , callBack));
			return;
		}
		if (editToken === -1) return callBack(false);
		var baseURL = "http://www.google.com/reader/api/0/subscription/edit?client=settings";
		var params = {method: 'post' , onSuccess: this.deleteFeedSuccess.bind(this , feed , callBack) , onFailure: this.deleteFeedFailure.bind(this , feed , callBack)};
		params.parameters = {
			ac: 'unsubscribe',
			s: feed.id,
			t: feed.title,
			T: editToken
		};
		params.requestHeaders = this.getRequestHeaders();
		
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	deleteFeedSuccess: function(feed , callBack , t)
	{
		if (t.status != 200) return this.deleteFeedFailure(feed , callBack);
		this.removeFeedFromAll(feed);
		callBack(true);
	},
	
	deleteFeedFailure: function(feed , callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	removeFeedFromAll: function(feed)
	{
		try
		{
			this.feeds = this.feeds.without(feed);
			this.display = this.display.without(feed);
			for(var i in this.folders) if (this.folders.hasOwnProperty(i))
			{
				try
				{
					this.folders[i].feeds = this.folders[i].feeds.without(feed);
				}
				catch(e){}
			}
		}
		catch(e){}
	},
	
	resetAllFeeds: function()
	{
		Mojo.Log.info('-----------resetAllFeeds');
		this.allItemsFeed = false;
		this.feeds = [];
		this.display = [];
		this.folders = {};
	},
	
	abortRequests: function()
	{
		if (this.ajaxRequest && this.ajaxRequest.transport && this.ajaxRequest.transport.abort)
		{
			this.ajaxRequest.transport.abort();
		}
	},
	
	
	addFeedsToDepot: function(callBack , count)
	{
		try
		{
			callBack = callBack || Mojo.doNothing;
			count = count || 1;
			if (this.depotError || count > 5) return false;
			if (!this.depotReady) window.setTimeout(this.addFeedsToDepot.bind(this , callBack , count+1) , 500);
			
			var store = [];
			if (this.starredFeed && this.starredFeed.prepareForDatabase)
			{
				store.push(this.starredFeed.prepareForDatabase());
			}
			for (var i=0; i < this.feeds.length; i++)
			{
				var feed = this.feeds[i];
				if (feed.type == 'feed')
				{
					store.push(feed.prepareForDatabase()); 
				}
			}
			
			this.depot.add(this.allFeedsKey , store , this.addFeedsToDepotSuccess.bind(this , callBack) , this.addFeedsToDepotFailure.bind(this , callBack));
		}
		catch(e)
		{
			Mojo.Log.info('-----addFeedsToDepot::error---' , Object.toJSON(e));
			window.setTimeout(function(){callBack(false)} , 50);
		}
	},
	
	addFeedsToDepotSuccess: function(callBack)
	{
		Mojo.Log.info('-----------addFeedsToDepotSuccess');
		callBack = callBack || Mojo.doNothing;
		callBack(true);
	},
	
	addFeedsToDepotFailure: function(callBack , error)
	{
		Mojo.Log.info('-----------addFeedsToDepotFailure' , error);
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	},
	
	getFeedsFromDepot: function(callBack , count)
	{
		callBack = callBack || Mojo.doNothing;
		count = count || 1;
		if (this.depotError || count > 5) return callBack(false);
		if (!this.depotReady) window.setTimeout(this.getFeedsFromDepot.bind(this , callBack , count+1) , 500);
		
		this.depot.get(this.allFeedsKey , this.getFeedsFromDepotSuccess.bind(this , callBack) , this.getFeedsFromDepotFailure.bind(this , callBack));
	},
	
	getFeedsFromDepotSuccess: function(callBack , feeds)
	{
		Mojo.Log.info('---------getFeedsFromDepotSuccess' , feeds.length);
		if (!feeds.length) return this.getFeedsFromDepotFailure(callBack);
		if (this.feeds.length) return;
		try
		{
			for(var i=0; i < feeds.length; i++)
			{
				if (feeds[i].type == 'psuedoFeed')
				{
					var feed = new Feeds.GooglePsuedoFeed(this);
				}
				else
				{
					var feed = new Feeds.GoogleFeed(this);
				}
				feed.load(feeds[i]);
				this.feeds.push(feed);
				this.addFeedToCategories(feed , true);
			}
			callBack(true);
			return;
		}
		catch(e)
		{
			Mojo.Log.error('+++++++getFeedsFromDepot-ERROR' , Object.toJSON(e));
			return this.getFeedsFromDepotFailure(callBack);
		}
		
	},
	
	getFeedsFromDepotFailure: function(callBack)
	{
		Mojo.Log.info('---------getFeedsFromDepotFailure');
		callBack = callBack || Mojo.doNothing;
		return callBack(false);
	},
	
	addAllArticlesToDepot: function(callBack)
	{
		if (!this.feeds || !this.feeds.length) return window.setTimeout(function(){callBack(false);} , 50);
	},
	
	goOffline: function()
	{
		Mojo.Log.info('googleManager::goOffline');
		this.offlineMode = true;
		this.resetAllFeeds();
	},
	
	goOnline: function()
	{
		Mojo.Log.info('googleManager::goOnline');
		this.offlineMode = false;
		this.resetAllFeeds();
	},
	
	
	
	
	/// DEPOT INFO
	initializeDepot: function()
	{
		if (!this.depot)
		{
			Mojo.Log.info('++++++++++initializeDepot');
			this.depot = new Mojo.Depot({name: 'ext:FeedsGoogleManager' , estimatedSize:100000000} , this.initializeDepotSuccess.bind(this), this.initializeDepotFailure.bind(this));
		}	
	},
	
	initializeDepotSuccess: function()
	{
		Mojo.Log.info('++++++++++initializeDepotSuccess');
		this.depotReady = true;
		this.depotError = false;
	},
	
	initializeDepotFailure: function(e)
	{
		Mojo.Log.info('++++++++++initializeDepotFailure' , e);
		this.depotReady = false;
		this.depotError = true;
	},
	
	getDepot: function()
	{
		return this.depot;
	}
	

});