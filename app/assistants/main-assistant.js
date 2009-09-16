MainAssistant = Class.create(Delicious.Assistant , {
	
	initialize: function()
	{
		this.model = {listTitle: 'Feeds' , items: []};
		this.attributes = { itemTemplate: "main/feedItem" , listTemplate: "main/list" ,
             				swipeToDelete: true , reorderable: true , renderLimit: 500 };
        this.createListeners();
	},
	
	createListeners: function()
	{
		this.addNewFeed = this.addNewFeed.bindAsEventListener(this);
		this.listTapHandler = this.listTapHandler.bindAsEventListener(this);
		this._refreshCounts = this.refreshCounts.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.addIcon = this.controller.get('addIcon');
		if (!Feeds.Manager)
		{
			Feeds.Manager = new Feeds.FeedManager();
		}
		this.controller.setupWidget('feedsList' , this.attributes , this.model);
		this.showLoader();
		//Feeds.Manager.initTable(this.getFeeds.bind(this));
		
		this.manager = Feeds.GoogleAccount.getManager();
		if (this.manager.SID)
		{
			this.manager.getAllFeedsList(this.getAllFeeds.bind(this));
		}
		else
		{
			var loginInfo = Feeds.GoogleAccount.getLogin();
			this.manager.login(loginInfo.email , loginInfo.password , this.getAllFeeds.bind(this));
		}
	},
	
	activate: function(o)
	{
		var o = o || {};
		this.activateScrollTop();
		this.addIcon.observe(Mojo.Event.tap , this.addNewFeed);
		
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.observe('click' , this._refreshCounts);
		}
		
		
		if (o.refresh)
		{
			this.refreshList();
		}
		
		var feedsList = this.controller.get('feedsList');
		if (feedsList)
		{
			feedsList.observe(Mojo.Event.listTap , this.listTapHandler);
		}
		
		this.countChanged();
	},
	
	deactivate: function()
	{
		this.deactivateScrollTop();
		this.addIcon.stopObserving(Mojo.Event.tap , this.addNewFeed);
		var feedsList = this.controller.get('feedsList');
		if (feedsList)
		{
			feedsList.stopObserving(Mojo.Event.listTap , this.listTapHandler);
		}
		
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.stopObserving(Mojo.Event.tap , this._refreshCounts);
		}
	},
	
	cleanup: function()
	{
	
	},
	
	listTapHandler: function(event)
	{
		var feed = event.item;
		this.controller.stageController.pushScene('view-feed' , {'feed': feed});
	},
	
	refreshList: function()
	{
		this.getFeeds();
	},
	
	refreshCounts: function(e)
	{
		if (this._isRefreshing) return;
		
		this.showSmallLoader();
		this._isRefreshing = true;
		this.manager.updateUnreadCount(this.refreshCountsCallBack.bind(this));
	},
	
	refreshCountsCallBack: function()
	{
		this._isRefreshing = false;
		this.hideSmallLoader();
		this.countChanged();
	},
	
	modelChanged: function()
	{
		this.controller.modelChanged(this.model);
	},
	
	countChanged: function()
	{
		this.model.items = this.manager.feeds;
		this.modelChanged();
	},
	
	getFeeds: function()
	{
		Feeds.Manager.getFeeds(this.getFeedsCallBack.bind(this));
	},
	
	getFeedsCallBack: function(response)
	{
		Mojo.Log.info('getFeedsCallBack' , Object.toJSON(response));
		this.hideLoader();
		if (response.success)
		{
			this.model.items = response.feeds;
			this.modelChanged();
		}
	},
	
	addNewFeed: function()
	{
		this.controller.stageController.pushScene('add-feed');
	},
	
	getAllFeeds: function(t)
	{
		if (!t) return;
		this.manager.getAllFeedsList(this.getAllFeedsCallBack.bind(this));
	},
	
	getAllFeedsCallBack: function(success)
	{
		if (success)
		{
			this.model.items = this.manager.feeds;
			this.modelChanged();
			this.manager.updateUnreadCount(this.countChanged.bind(this));
		}
		else
		{
			this.errorDialog("Unable to load feeds from google.");
		}
		this.hideLoader();
	},
	
	showSmallLoader: function()
	{
		if (!this._smallLoader)
		{
			this._smallLoader = new Element('div' , {className:"smallLoader overIcon"});
		}
		
		if (!this._smallLoader.parentNode)
		{
			this.controller.sceneElement.appendChild(this._smallLoader);
		}
		this._smallLoader.show();
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.hide();
		}
	},
	
	hideSmallLoader: function()
	{
		this._smallLoader.remove();
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.show();
		}
	}
	
	
});