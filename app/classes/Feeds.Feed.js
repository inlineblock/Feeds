Feeds.Feed = Class.create({
	callBacks: false,
	
	icon: false,
	title: false,
	feedURL: false,
	sortOrder: false,
	addedTime: false, 
	
	initialize: function()
	{
		this.callBacks = {};
		this.sortOrder = 1000;
		this.createListeners();
	},
	
	loadData: function(o)
	{
		var o = o || {};
		this.feed_id = o.feed_id;
		this.sortOrder = o.feed_order;
		this.title = o.feed_title;
		this.feedURL = o.feed_url;
		this.addedTime = o.feed_added;
	},
	
	createListeners: function()
	{
		this._validateFeedSuccess = this.validateFeedSuccess.bind(this);
		this._validateFeedFailure = this.validateFeedFailure.bind(this);
	},
	
	setIcon: function(icon)
	{
		this.icon = icon;
	},
	
	setTitle: function(title)
	{
		this.title = title;
	},
	
	setFeedURL: function(url)
	{
		this.feedURL = url;
		return true;
	},
	
	prepForInsertion: function()
	{
		if (!this.title) this.title = "Title";
		if (!this.feedURL) this.feedURL = "http://news.google.com/news?pz=1&ned=us&hl=en&topic=h&num=3&output=rss";
		if (!this.sortOrder) this.sortOrder = 1000;
		if (!this.addedTime)
		{
			var d = new Date();
			this.addedTime = Math.floor(d.getTime()/1000);
		}
	},
	
	validateFeed: function(cB)
	{
		this.callBacks['validateFeed'] = cB || function(){};
		if (!this.feedURL)
		{
			console.log('invalidFeed');
			console.dir(this.feedURL);
			this.callBacks['validateFeed'](false , this);
			delete this.callBacks['validateFeed'];
			return;
		}
		
		var ajax = new Ajax.Request(this.feedURL , {onSuccess: this._validateFeedSuccess , onFailure: this._validateFeedFailure});
	},
	
	validateFeedSuccess: function(t)
	{
		if (!t.responseXML)
		{
			this.callBacks['validateFeed'](false , this);
			delete this.callBacks['validateFeed'];
			return;
		}
		else
		{
			this.callBacks['validateFeed'](true , this);
			delete this.callBacks['validateFeed'];
			return;
		}
	},
	
	validateFeedFailure: function(t)
	{
		this.callBacks['validateFeed'](false , this);
		delete this.callBacks['validateFeed'];
		return;
	}
	
	
});