ViewFeedAssistant = Class.create(Delicious.Assistant , {
	feed: false,
	
	initialize: function(o)
	{
		var o = o || {};
		this.feed = o.feed || false;
		
		this.model = {listTitle: 'Articles' , items: []};
		this.attributes = { itemTemplate: "view-feed/articleItem" , listTemplate: "view-feed/articleList" ,
             				swipeToDelete: true , reorderable: true , renderLimit: 500 };
             				
        this.createListeners();
	},
	
	createListeners: function()
	{
		this.listTapHandler = this.listTapHandler.bindAsEventListener(this);
		this._refreshList = this.refreshList.bindAsEventListener(this);
		this._loadMoreList = this.loadMoreList.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.showLoader();
		var title = this.controller.get('feedTitle');
		title.innerHTML = this.feed.title;
		
		this.controller.setupWidget('articlesList' , this.attributes , this.model);
		this.feed.getArticles(this.getArticlesCallBack.bind(this));
		
	},
	
	activate: function(o)
	{	
		var articlesList = this.controller.get('articlesList');
		if (articlesList)
		{
			articlesList.observe(Mojo.Event.listTap , this.listTapHandler);
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
	
	getArticlesCallBack: function(retreived)
	{
		this.hideLoader();
		this.articlesChanged();
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
		if (this._isRefreshing) return;
		
		this.showSmallLoader();
		this._isRefreshing = true;
		this.feed.refreshArticles(this.refreshListCallBack.bind(this));
	},
	
	refreshListCallBack: function()
	{
		this._isRefreshing = false;
		this.hideSmallLoader();
		this.articlesChanged();
	},
	
	
	loadMoreList: function(e)
	{
		if (this._isRefreshing) return;
		var loadMore = this.controller.get('loadMore');
		if (loadMore)
		{
			loadMore.addClassName('loading');
		}
		this.showSmallLoader();
		this._isRefreshing = true;
		this.feed.loadMoreArticles(this.loadMoreListCallBack.bind(this));
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
	}

});