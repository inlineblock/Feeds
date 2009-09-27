Feeds.GoogleArticle = Class.create({
	feed: false,
	
	id: false,
	directLink: false,
	author: false,
	categories: [],
	origin: false,
	published: false,
	updated: false,
	text: false,
	title: false,
	direction: false,
	
	
	className: "",
	
	tokenTry: false,
	
	initialize: function(feed)
	{
		this.feed = feed;
		
		this.categories = [];
		this.className = "";
	},
	
	load: function(o)
	{
		var o = o || {};
		try
		{
			this.raw = o;
			this.id = o.id;
			this.title = o.title;
			this.updated = o.updated;
			this.published = o.published;
			this.author = o.author;
			this.categories = o.categories;
			this.alternate = o.alternate;
			
			if (o.origin)
			{
				this.origin = o.origin;
			}
			
			if (o.summary && o.summary.content)
			{
				this.text = o.summary.content;
				if (o.summary.direction)
				this.direction = o.summary.direction || false;
			}
			
			if (o.content && o.content.content)
			{
				this.text = o.content.content;
				if (o.content.direction)
				{
					this.direction = o.content.direction || false;
				}
			}
			
			
			this.prepareText();
			this.setupClasses();
			
		}
		catch(e)
		{
			Mojo.Log.error('+++++++Feeds.GoogleArticle LOAD:: ' ,Object.toJSON(e));
		}
	},
	
	prepareText: function()
	{
		this.preparedText = this.text.replace(/<script[\s\S]*<\/script([\s\S]*)>/ , "");
		this.preparedText = this.preparedText.replace(/<object[\s\S]*<\/object([\s\S]*)>/ , "");
		this.preparedText = this.preparedText.replace(/<iframe[\s\S]*<\/iframe([\s\S]*)>/ , "");
	},
	
	setupClasses: function()
	{
		if (!this.hasBeenRead())
		{
			this.className += " unread";
		}
		this.className = this.className.trim();
	},
	
	removeUnreadClassName: function()
	{
		this.className = this.className.replace('unread' , '').trim();
	},
	
	hasBeenRead: function()
	{
		if (this.categories.length)
		{
			for(var i=0; i < this.categories.length; i++)
			{
				var cat = this.categories[i];
				if (cat.substr(cat.length-15 , cat.length) == "com.google/read")
				{
					return true;
				}
			}
		}
		return false;
	},
	
	markAsRead: function(token)
	{
		if (this.hasBeenRead()) return false;
		
		var token = token || false;
		if (!token)
		{
			this.feed.manager.getEditToken(this.markAsRead.bind(this));
			return;
		}
		var params = {method:'post'};
		params.requestHeaders = this.feed.manager.getRequestHeaders();
		params.parameters = {'T':token , a: this.getUnreadTag() , async: 'true' , i: this.id , s:this.feed.id , onSuccess: this.decrementFeedUnreadCount.bind(this)}; 
		this.ajaxRequest = new Ajax.Request('http://www.google.com/reader/api/0/edit-tag?client=PalmPre' , params);
		this.decrementFeedUnreadCount();
	},
	
	decrementFeedUnreadCount: function(t)
	{
		this.feed.unreadCount--;
		this.categories.push(this.getUnreadTag());
		this.removeUnreadClassName();
	},
	
	getUnreadTag: function()
	{
		return 'user/-/state/com.google/read';
		if (!this.categories) return 'read';
		var baseTag = this.categories[0];
		var parts = baseTag.split('/');
		var forget = parts.pop();
		parts.push('read');
		return parts.join('/');
	},
	
	getPreviousArticle: function()
	{
		if (!this.feed || !this.feed.articles.length) return false;
		var index = this.feed.articles.indexOf(this);
		if (index < 1) return false;
		return this.feed.articles[index-1];
	},
	
	getNextArticle: function()
	{
		if (!this.feed || !this.feed.articles.length) return false;
		var index = this.feed.articles.indexOf(this);
		if (index+1 >= this.feed.articles.length) return false;
		return this.feed.articles[index+1];
	},
	
	getArticleLink: function()
	{
		if (this.alternate && this.alternate.length > 0)
		{
			var alt = this.alternate[0];
			if (alt.href)
			{
				return alt.href;
			}
		}
		return false;
	}
	
});