Feeds.GooglePsuedoFeed = Class.create(Feeds.GoogleFeed , {
	type:'psuedoFeed',

	load: function(o)
	{
		o = o || {};
		try
		{
			this.createID(o);
			this.categories = []; // array of categories
			this.sortid = 1;
			this.firstItemSecond = o.firstitemsec || 0;
			this.unreadCount = o.unreadcount || 0;
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
		}
		
		this.setupClasses();
	},
	
	getRequestHeaders: function()
	{
		return this.manager.getRequestHeaders();
	},
	
	createID: function(o)
	{
		this.id = o.id || "user/-/state/com.google/reading-list";
		this.title = o.title || "All items";
	},
	
	setupClasses: function() // FOR TEMPLATING
	{
		this.className = "psuedo";
		
		if (this.unreadCount)
		{
			this.className += " hasCount";
		}
		this.className = this.className.trim();
	},
	
	markAllAsRead: function(callBack)
	{
		if (this.id == "user/-/state/com.google/reading-list")
		{
			return this.manager.markAllAsRead(this.markAllAsReadReadingListCallBack.bind(this , callBack) , editToken);
		}
		else
		{
			return this.manager.markAllAsRead(callBack);
		}
		
	},
	
	markAllAsReadReadingListCallBack: function(callBack , worked)
	{
		callBack = callBack || Mojo.doNothing;
		if (worked)
		{
			this.blindMarkAllAsRead();
		}
		callBack(worked);
	},
	
	blindMarkAllAsRead: function()
	{
		for (var i=0; i < this.articles.length; i++)
		{
			if (this.articles[i])
			{
				this.articles[i].decrementFeedUnreadCount();
			}
		}
		this.setUnreadCount(0);
	}

});