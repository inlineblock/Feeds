Feeds.FeedManager = Class.create({
	initialize: function()
	{
		this.db = new Delicious.Database();
		this.callBacks = {};
	},
	
	initTable: function(cB)
	{
		var cB = cB || function() {};
		var query = "CREATE TABLE IF NOT EXISTS feeds ( \
														feed_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT ,\
														feed_title TEXT , \
														feed_url TEXT , \
														feed_order UNSIGNED INTEGER NOT NULL , \
														feed_added UNSIGNED INTEGER NOT NULL \
														);";
		this.db.setQuery(query)
		this.db.execute(cB);
	},
	
	getFeeds: function(callBack)
	{
		var callBack = callBack || function() {};
		this.callBacks['getFeeds'] = callBack;
		var query = "SELECT * FROM feeds ORDER BY feed_order ASC , feed_added DESC";
		this.db.setQuery(query)
		this.db.execute(this.getFeedsCB.bind(this));
	},
	
	getFeedsCB: function(t , e)
	{
		if (e.error)
		{
			this.callBacks['getFeeds']({error: t.errorMsg + " code: " + t.errorCode});
			this.callBacks['getFeeds'] = function() {};
		}
		else
		{
			var list = t.getAll();
			var feeds = [];
			for(var i=0; i < list.length; i++)
			{
				var feed = new Feeds.Feed();
				feed.loadData(list[i]);
				feeds.push(feed);
			}
			this.callBacks['getFeeds']({'success': true , 'feeds': feeds});
			this.callBacks['getFeeds'] = function() {};
		}
	},
	
	addNewFeed: function(feed , cB) // takes Feeds.Feed objects only!
	{
		this.callBacks['addNewFeed'] = cB || function(){};
		
		var query = "INSERT into feeds VALUES ( null , ? , ? , ? , ? );";
		feed.prepForInsertion();
		var args = [ feed.title , feed.feedURL , feed.sortOrder , feed.addedTime ];
		this.db.setQuery(query , args);
		this.db.execute(this.addNewCallBack.bind(this));
	},
	
	addNewCallBack: function(t , q)
	{
		this.callBacks['addNewFeed']();
		delete this.callBacks['addNewFeed'];
	}

});