Feeds.GoogleFeed = Class.create({
	manager: false,
	articles: [],
	
	id: false,
	title: false,
	categories: false,
	sortid: false,
	firstItemSecond: false,
	
	unreadCount: false,
	continuation: false,
	
	className: "",
	type:'feed',
	
	initialize: function(manager)
	{
		this.manager = manager; // this is the Feeds.Google object - it contains everything you need for editing authentication aka SID/username/password
		this.articles = []; // cleanup prototyping
		this.className = "";
	},
	
	getRequestHeaders: function()
	{
		return this.manager.getRequestHeaders();
	},
	
	load: function(o)
	{
		try
		{
			this.id = o.id || false;
			this.title = o.title || false;
			this.categories = o.categories || []; // array of categories
			this.sortid = o.sortid || 0;
			this.firstItemSecond = o.firstitemsec || 0;
			this.unreadCount = o.unreadcount || 0;
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
		}
		
		this.setupClasses();
	},
	
	setupClasses: function() // FOR TEMPLATING
	{
		this.className = "feed";
		if (this.unreadCount)
		{
			this.className += " hasCount";
		}
		this.className = this.className.trim();
	},
	
	getID: function()
	{
		return this.id || false;
	},
	
	getUnreadCount: function()
	{
		return parseInt(this.unreadCount) || 0;
	},
	
	setUnreadCount: function(count)
	{
		this.unreadCount = parseInt(count);
		this.setupClasses();
	},
	
	getArticles: function(callBack , getType)
	{
		Mojo.Log.info('----Feeds.GoogleFeed::getArticles');
		getType = getType || 'all';
		callBack = callBack || Mojo.doNothing;
		var baseURL = "http://www.google.com/reader/api/0/stream/contents/" + escape(this.id);
		var params = {method: 'get' , onSuccess: this.getArticlesSuccess.bind(this , callBack) , onFailure: this.getArticlesFailure.bind(this , callBack)};
		params.parameters = {
			n: Feeds.Preferences.getCount(),
			ck: Delicious.getTimeStamp(),
		}
		Mojo.Log.info('--------getArticles' , getType , this.title);
		if (getType == 'unread')
		{
			params.parameters.xt = 'user/-/state/com.google/read';
		}
		
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	getArticlesSuccess: function(callBack , t)
	{
		if (t.status != 200) return this.getArticlesFailure(callBack);
		try
		{
			var info = t.responseText.evalJSON();
			this.continuation = info.continuation;
			for (var i=0; i < info.items.length; i++)
			{
				var article = new Feeds.GoogleArticle(this);
				article.load(info.items[i]);
				this.articles.push(article);
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
			return this.getArticlesFailure(callBack);
		}
		
	},
	
	getArticlesFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	getOfflineArticles: function(callBack)
	{
		Mojo.Log.info('-----------getOfflineArticles');
		this.manager.getDepot().get(this.id , this.getOfflineArticlesSuccess.bind(this , callBack) , this.getOfflineArticlesFailure.bind(this , callBack));
	},
	
	getOfflineArticlesSuccess: function(callBack , articles)
	{
		if (!articles.length) return this.getOfflineArticlesFailure(callBack);
		
		try
		{
			for (var i=0; i < articles.length; i++)
			{
				var article = new Feeds.GoogleArticle(this);
				article.load(articles[i]);
				this.articles.push(article);
			}
			callBack(true);
		}
		catch(e)
		{
			return this.getOfflineArticlesFailure(callBack);
		}
	},
	
	getOfflineArticlesFailure: function(callBack)
	{
		callBack(false);
	},
	
	refreshArticles: function(callBack , getType)
	{
		getType = getType || 'all';
		var callBack = callBack || Mojo.doNothing;
		var baseURL = "http://www.google.com/reader/api/0/stream/contents/" + this.id;
		var params = {method: 'get' , onSuccess: this.refreshArticlesSuccess.bind(this , callBack) , onFailure: this.refreshArticlesFailure.bind(this , callBack)};
		params.parameters = {
			n: Feeds.Preferences.getCount(),
			ck: Delicious.getTimeStamp(),
		}
		
		if (getType == 'unread')
		{
			params.parameters.xt = 'user/-/state/com.google/read';
			this.removeAllReadArticles();
		}
		
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	refreshArticlesSuccess: function(callBack , t)
	{
		if (t.status != 200) return this.refreshArticlesFailure(callBack);
		try
		{
			var info = t.responseText.evalJSON();
			for (var i=0; i < info.items.length; i++)
			{
				var article = new Feeds.GoogleArticle(this);
				article.load(info.items[i]);
				
				this.fitArticle(article);
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
			return this.getArticlesFailure(callBack);
		}
		callBack(true);
	},
	
	refreshArticlesFailure: function(callBack , t)
	{
		callBack(false);
	},
	
	
	loadMoreArticles: function(callBack , getType)
	{
		getType = getType || 'all';
		var callBack = callBack || Mojo.doNothing;
		var baseURL = "http://www.google.com/reader/api/0/stream/contents/" + this.id;
		var params = {method: 'get' , onSuccess: this.loadMoreArticlesSuccess.bind(this , callBack) , onFailure: this.loadMoreArticlesFailure.bind(this , callBack)};
		params.parameters = {
			n: Feeds.Preferences.getCount(),
			ck: Delicious.getTimeStamp(),
			c: this.continuation
		}
		
		if (getType == 'unread')
		{
			params.parameters.xt = 'user/-/state/com.google/read';
		}
		
		params.requestHeaders = this.getRequestHeaders();
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	loadMoreArticlesSuccess: function(callBack , t)
	{
		if (t.status != 200) return this.loadMoreArticlesFailure(callBack);
		try
		{
			var info = t.responseText.evalJSON();
			this.continuation = info.continuation;
			for (var i=0; i < info.items.length; i++)
			{
				var article = new Feeds.GoogleArticle(this);
				article.load(info.items[i]);
				
				this.fitArticle(article);
			}
			callBack(true);
		}
		catch(e)
		{
			Mojo.Log.error(Object.toJSON(e));
			return this.getArticlesFailure(callBack);
		}
		callBack(true);
	},
	
	loadMoreArticlesFailure: function(callBack , t)
	{
		callBack(false);
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
		params.requestHeaders = this.getRequestHeaders();
		
		this.ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	markAllAsReadSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return this.markAllAsReadFailure(callBack);
		for (var i=0; i < this.articles.length; i++)
		{
			if (this.articles[i])
			{
				this.articles[i].decrementFeedUnreadCount();
			}
		}
		this.setUnreadCount(0);
		return callBack(true);
	},
	
	markAllAsReadFailure: function(callBack ,t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false);
	},
	
	fitArticle: function(article)
	{
		if (this.articles.length == 0)
		{
			return this.articles.push(article);
		}
		
		var aid = article.published,
			fid = this.articles[0].published,
			lid = this.articles[this.articles.length - 1].published;
		if (aid > fid)
		{
			this.articles.unshift(article);
		}
		else if (lid > aid)
		{
			this.articles.push(article);
		}
	},
	
	resetArticles: function()
	{
		this.continuation = false;
		this.articles = [];
	},
	
	removeAllReadArticles: function()
	{
		var articles = [];
		for(var i=0; i < this.articles.length; i++)
		{
			if (this.articles && this.articles[i] && !this.articles[i].hasBeenRead())
			{
				articles.push(this.articles[i]);
			}
		}
		
		this.articles = articles;
	},
	
	abortRequests: function()
	{
		if (this.ajaxRequest && this.ajaxRequest.transport && this.ajaxRequest.transport.abort)
		{
			this.ajaxRequest.transport.abort();
		}
	},
	
	prepareForDatabase: function()
	{
		return {id: this.id , title: this.title , categories: this.categories , sortid: this.sortid , firstitemsec: this.firstItemSecond , unreadcount: this.unreadCount , type: this.type , className: this.className};
	},
	
	
	addArticlesToDepot: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		var store = [];
		this.articles.each(function(a){ store.push(a.prepareForDatabase()); });
		this.manager.getDepot().add(this.id , store , this.addArticlesToDepotSuccess.bind(this , callBack) , this.addArticlesToDepotFailure.bind(this , callBack));
	},
	
	addArticlesToDepotSuccess: function(callBack)
	{
		callBack = callBack || Mojo.doNothing;
		callBack(true);
	},
	
	addArticlesToDepotFailure: function(callBack , e)
	{
		Mojo.Log.info('-----------addArticlesToDepotFailure' , e);
		callBack = callBack || Mojo.doNothing;
		callBack(false);
	}
	
});