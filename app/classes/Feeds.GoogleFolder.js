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
	
	initialize: function(manager , o)
	{
		this.manager = manager;
		this.id = o.id;
		this.setTitle(o.label);
		this.feeds = [];
		this.display = [];
		this.unreadCount = 0;
		this.setupAllItemsFeed();
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
	
	abortRequests: function()
	{
		if (this.ajaxRequest && this.ajaxRequest.transport && this.ajaxRequest.transport.abort)
		{
			this.ajaxRequest.transport.abort();
		}
	}
});