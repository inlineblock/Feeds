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
	
	markAllAsRead: function(callBack , editToken)
	{
		if (this.id == "user/-/state/com.google/reading-list")
		{
			return this.manager.markAllAsRead(this.markAllAsReadReadingListCallBack.bind(this , callBack) , editToken);
		}
		
		callBack = callBack || Mojo.doNothing;
		editToken = editToken || false;
		
		if (!editToken)
		{
			this.getEditToken(this.markAllAsRead.bind(this , callBack));
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
		params.requestHeaders = this.manager.getRequestHeaders();
		this.blindMarkAllAsRead();
		this._ajaxRequest = new Ajax.Request(baseURL , params);
	},
	
	markAllAsReadSuccess: function(callBack , t)
	{
		callBack = callBack || Mojo.doNothing;
		if (t.status != 200) return this.markAllAsReadFailure(callBack);
		
		return callBack(true);
	},
	
	markAllAsReadFailure: function(callBack ,t)
	{
		callBack = callBack || Mojo.doNothing;
		return callBack(false);
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