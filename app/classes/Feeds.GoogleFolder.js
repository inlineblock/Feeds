Feeds.GoogleFolder = Class.create({
	isFolder:true,
	id: false,
	title: false,
	feeds: [],
	unreadCount: false,
	
	className: "folder",
	type: 'folder',
	
	initialize: function(o)
	{
		this.id = o.id;
		this.setTitle(o.label);
		this.feeds = [];
		this.unreadCount = 0;
	},
	
	setTitle: function(title)
	{
		this.title = title;
	},
	
	addFeed: function(feed)
	{
		this.feeds.push(feed);
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
});