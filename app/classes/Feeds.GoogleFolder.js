Feeds.GoogleFolder = Class.create({
	manager: false,
	
	isFolder:true,
	id: false,
	title: false,
	feeds: [],
	display: [],
	unreadCount: false,
	
	className: "folder",
	type: 'folder',
	
	initialize: function(manager , o , offlineMode)
	{
		offlineMode = offlineMode || false;
		this.manager = manager;
		this.id = o.id;
		this.setTitle(o.label);
		this.feeds = [];
		this.display = [];
		this.unreadCount = 0;
		if (!offlineMode)
		{
			this.setupAllItemsFeed();
		}
	},
	
	setTitle: function(title)
	{
		this.title = title;
	},
	
	addFeed: function(feed)
	{
		this.feeds.push(feed);
		this.display.push(feed);
		//this.refreshUnreadCount();
	},
	
	refreshUnreadCount: function()
	{
		try
		{
			if (this.feeds && this.feeds.length)
			{
				var count = 0;
				for (var i=0; i < this.feeds.length; i++)
				{
					count += this.feeds[i].unreadCount;
				}
				this.unreadCount = count;
			}
			if (this.allItemsFeed)
			{
				this.allItemsFeed.setUnreadCount(this.unreadCount);
			}
			this.setupClasses();
		}
		catch(e)
		{
			Mojo.Log.error('Feeds.GoogleFolder :: refreshUnreadCount' , Object.toJSON(e));
		}
	},
	
	setupClasses: function() // FOR TEMPLATING
	{
		this.className = "folder";
		if (this.unreadCount)
		{
			this.className += " hasCount";
		}
		this.className = this.className.trim();
	},
	
	setupAllItemsFeed: function()
	{
		if (this.display.length == 0)
		{
			this.allItemsFeed = new Feeds.GooglePsuedoFeed(this);
			this.allItemsFeed.load({id: this.id , title: this.title});
			this.display.push(this.allItemsFeed);
		}
	},
	
	getRequestHeaders: function()
	{
		return this.manager.getRequestHeaders();
	},
	
	getDepot: function()
	{
		return this.manager.getDepot();
	},
	
	abortRequests: function()
	{
		if (this.ajaxRequest && this.ajaxRequest.transport && this.ajaxRequest.transport.abort)
		{
			this.ajaxRequest.transport.abort();
		}
	},
	
	getEditToken: function(callBack)
	{
		this.manager.getEditToken(callBack);
	},
	
	markAllAsRead: function(callBack , editToken)
	{
		
		callBack = callBack || Mojo.doNothing;
		editToken = editToken || false;
		
		if (editToken === -1) return callBack(false);
		if (!editToken)
		{
			this.manager.getEditToken(this.markAllAsRead.bind(this , callBack));
			return;
		}
		
		var baseURL = "http://www.google.com/reader/api/0/mark-all-as-read?client=PalmPre";
		var params = {method: 'post' , onSuccess: this.markAllAsReadSuccess.bind(this , callBack) , onFailure: this.markAllAsReadFailure.bind(this , callBack)};
		params.parameters = {
			ts: Delicious.getTimeStamp(),
			s: this.id ,
			t: this.title ,
			T: editToken
		};
		params.requestHeaders = this.manager.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	markAllAsReadSuccess: function(callBack , t)
	{
		Mojo.Log.info('---------------markAllAsReadSuccess' , t.status);
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
		this.feeds.each(function(f) { f.setUnreadCount(0) });
		this.refreshUnreadCount();
	}
	
});