ViewFeedAssistant = Class.create(Delicious.Assistant , {
	feed: false,
	
	initialize: function(o)
	{
		var o = o || {};
		this.feed = o.feed || false;
		
		this.model = {listTitle: 'Articles' , items: []};
		this.attributes = { itemTemplate: this.getArticleItemTemplate() , listTemplate: "view-feed/articleList" ,
             				swipeToDelete: false , reorderable: false , renderLimit: 500 };
             				
        this.createListeners();
	},
	
	createListeners: function()
	{
		this.listTapHandler = this.listTapHandler.bindAsEventListener(this);
		this._refreshList = this.refreshList.bindAsEventListener(this);
		this._loadMoreList = this.loadMoreList.bindAsEventListener(this);
		this._showMenu = this.showMenu.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.showLoader();
		var title = this.controller.get('feedTitle');
		title.innerHTML = this.feed.title;
		
		this.controller.setupWidget('articlesList' , this.attributes , this.model);
		
		this.feed.getArticles(this.getArticlesCallBack.bind(this) , Feeds.Preferences.getAllUnreadSettings());
		
		this.controller.setupWidget(Mojo.Menu.appMenu , {} , {items:[{label: $L('Mark All As Read') , command: "markAllAsRead"}]});
		
		this.setToggleClassName();
	},
	
	activate: function(o)
	{	
		var articlesList = this.controller.get('articlesList');
		if (articlesList)
		{
			articlesList.observe(Mojo.Event.listTap , this.listTapHandler);
		}
		
		var toggleIcon = this.controller.get('toggleIcon');
		if (toggleIcon)
		{
			toggleIcon.observe(Mojo.Event.tap , this._showMenu);
		}
		
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.observe(Mojo.Event.tap , this._refreshList);
		}
		
		var loadMore = this.controller.get('loadMore');
		if (loadMore)
		{
			loadMore.observe(Mojo.Event.tap , this._loadMoreList);
		}
		
		this.activateScrollTop();
		this.articlesChanged();
	},
	
	deactivate: function()
	{
		var articlesList = this.controller.get('articlesList');
		if (articlesList)
		{
			articlesList.stopObserving(Mojo.Event.listTap , this.listTapHandler);
		}
		
		var toggleIcon = this.controller.get('toggleIcon');
		if (toggleIcon)
		{
			toggleIcon.stopObserving(Mojo.Event.tap , this._showMenu);
		}
		
		var appIcon = this.controller.get('appIcon');
		if (appIcon)
		{
			appIcon.stopObserving(Mojo.Event.tap , this._refreshList);
		}
		
		var loadMore = this.controller.get('loadMore');
		if (loadMore)
		{
			loadMore.stopObserving(Mojo.Event.tap , this._loadMoreList);
		}
		
		this.deactivateScrollTop();
	},
	
	listTapHandler: function(event)
	{
		var article = event.item;
		this.controller.stageController.pushScene('view-article' , {'article': article});
	},
	
	getArticleItemTemplate: function()
	{
		if (this.feed.type == "feed")
		{
			return "view-feed/articleItem";
		}
		else
		{
			return "view-feed/articleFeedItem";
		}
	},
	
	getArticlesCallBack: function(retreived)
	{
		
		this.hideLoader();
		if (retreived)
		{
			this.articlesChanged();
		}
		else
		{
			this.errorDialog($L("Unable to load articles for this feed."));
		}
	},
	
	modelChanged: function()
	{
		this.controller.modelChanged(this.model);
	},
	
	articlesChanged: function()
	{
		this.model.items = this.feed.articles;
		this.modelChanged();
	},
	
	refreshList: function()
	{
		if (this._isRefreshing)
		{
			return;
		}
		
		this.showSmallLoader();
		this._isRefreshing = true;
		this.feed.refreshArticles(this.refreshListCallBack.bind(this) , Feeds.Preferences.getAllUnreadSettings());
	},
	
	refreshListCallBack: function()
	{
		this._isRefreshing = false;
		this.hideSmallLoader();
		this.articlesChanged();
	},
	
	
	loadMoreList: function(e)
	{
		if (this._isRefreshing){ return; }
		var loadMore = this.controller.get('loadMore');
		if (loadMore)
		{
			loadMore.addClassName('loading');
		}
		this.showSmallLoader();
		this._isRefreshing = true;
		this.feed.loadMoreArticles(this.loadMoreListCallBack.bind(this) , Feeds.Preferences.getAllUnreadSettings());
	},
	
	loadMoreListCallBack: function()
	{
		this._isRefreshing = false;
		this.hideSmallLoader();
		var loadMore = this.controller.get('loadMore');
		if (loadMore)
		{
			loadMore.removeClassName('loading');
		}
		this.articlesChanged();
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
	},
	
	markAllAsRead: function()
	{
		this.feed.markAllAsRead(this.markAllAsReadCallBack.bind(this));
		if (this._isRefreshing){ return; }
		
		this.showSmallLoader();
		this._isRefreshing = true;
	},
	
	markAllAsReadCallBack: function(finished)
	{
		this._isRefreshing = false;
		this.hideSmallLoader();
		if (finished)
		{
			this.articlesChanged();
		}
		else
		{
			this.errorDialog('Unable to mark all as read.');
		}
	},
	
	handleCommand: function(event)
	{
		
		if (this.feed && this.feed.type == 'psuedoFeed' && event.type == Mojo.Event.back)
		{
				event.preventDefault();
				return this.controller.stageController.popScene({refreshCounts:true});
		}
		
		if (event.type == Mojo.Event.command) 
		{
			switch (event.command) 
			{
				case "markAllAsRead":
					return window.setTimeout(this.markAllAsRead.bind(this) , 50); // this prevents the stutter of the appmenu when going up.
				break;
			}
		}
		
		this.doHandleCommand(event);
	},
	
	
	showMenu: function()
	{
		var toggle = Feeds.Preferences.getAllUnreadSettings();
		this.openElement = this.controller.popupSubmenu({ onChoose:this.showMenuChoose.bind(this) ,
																placeNear: this.controller.get('toggleIcon') ,
																toggleCmd: toggle ,
																items: [{label:'View All Items' , command:'all'} , {label:'View Unread Items' , command:'unread'}]
															  });
	},
	
	showMenuChoose: function(value)
	{
		if (!value) return;
		var toggle = Feeds.Preferences.getAllUnreadSettings();
		if (value != toggle)
		{
			Feeds.Preferences.setAllUnreadSettings(value);
			this.showLoader();
			this.setToggleClassName();
			this.feed.resetArticles();
			this.model.items = [];
			this.modelChanged();
			
			this.feed.getArticles(this.getArticlesCallBack.bind(this) , value);
		}
	},
	
	setToggleClassName: function()
	{
		var toggle = this.controller.get('toggleIcon');
		if (toggle)
		{
			toggle.removeClassName('all').removeClassName('unread').addClassName(Feeds.Preferences.getAllUnreadSettings());
		}
	}

});