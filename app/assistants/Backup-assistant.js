BackupAssistant = Class.create({
	initialize: function()
	{
		this.stop = false;
		this.feeds = [];
	},
	
	setup: function()
	{
		this.manager = Feeds.GoogleAccount.getManager();
		var loginInfo = Feeds.GoogleAccount.getLogin();
		
		this.manager.login(loginInfo.email , loginInfo.password , this.loginCallBack.bind(this));
		
		var offline = Feeds.Preferences.getOfflineSettings();
		this.fetchUnreadOnly = offline.unreadOnly;
		this.updateStatus = this.controller.get('updateStatus');
	},
	
	cleanup: function()
	{
		this.stop = true;
	},
	
	loginCallBack: function(success)
	{
		if (!success)
		{
			this.controller.showBanner({messageText: $L("There was an error backing up.") , icon: "Feeds"} , {} , "Feeds");
			return this.close();
		}
		this.manager.getFeedsFromDepot(this.getFeedsCallBack.bind(this));
	},
	
	getFeedsCallBack: function(worked)
	{
		if (!worked)
		{
			this.controller.showBanner({messageText: $L("There was an error backing up.") , icon: "Feeds"} , {} , "Feeds");
			return this.close();
		}
		this.feeds = this.manager.feeds;
		window.setTimeout(this.feedSpawner.bind(this) , 100);
	},
	
	feedSpawner: function()
	{
		if (this.stop) return false;
		if (this.feeds.length < 1)
		{
			return this.complete();
		}
		
		var feed = this.feeds[0];
		feed.getArticles(this.feedGetArticlesCallBack.bind(this , feed) , (this.fetchUnreadOnly && feed.type != 'psuedoFeed' ? 'unread' : 'all'));
		this.updateStatus.innerHTML = $L("Backing up ") + feed.title;
	},
	
	feedGetArticlesCallBack: function(feed , success)
	{
		if (!success)
		{
			Mojo.Log.info('---feedGetArticlesCallBack::FAILURE - ' , feed.id);
			return this.removeFeedAndSpawn(feed);
		}
		
		feed.addArticlesToDepot(this.feedBackupArticlesCallBack.bind(this , feed));
	},
	
	feedBackupArticlesCallBack: function(feed , success)
	{
		return this.removeFeedAndSpawn(feed);
	},
	
	removeFeedAndSpawn: function(feed)
	{
		this.feeds = this.feeds.without(feed);
		window.setTimeout(this.feedSpawner.bind(this) , 300);
	},
	
	complete: function()
	{
		this.controller.showBanner({messageText: $L("Feeds backup complete.") , icon: "Feeds"} , {} , "Feeds");
		return this.close();
	},
	
	close: function()
	{
		window.setTimeout(function(){Feeds.StageManager.close('Backup');} , 400);
	}

});