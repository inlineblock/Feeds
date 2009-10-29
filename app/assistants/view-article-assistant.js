ViewArticleAssistant = Class.create(Delicious.Assistant , {
	article: false,
	
	previousArticle: false,
	nextArticle: false,
	articleLink: false,
	
	
	lastDrag: false,
	
	initialize: function(o)
	{
		o = o || {};
		this.article = o.article;
		
		this._loadFullImage = this.loadFullImage.bindAsEventListener(this);
		this._anchorTap = this.anchorTap.bindAsEventListener(this);
		this._onDragging = this.onDragging.bindAsEventListener(this);
		this._onDragEnd = this.onDragEnd.bindAsEventListener(this);
	},
	
	setup: function()
	{
		//var title = this.controller.get('articleTitle');
		//title.innerHTML = this.article.title;
		var landscape = Feeds.Preferences.getLandscapeSettings();
		if (landscape.gestures)
		{
			this.controller.useLandscapePageUpDown(true);
		}
		
		var insertHere = this.controller.get('insertHere');
		insertHere.innerHTML = Mojo.View.render({object: this.article , template: this.getArticleTemplate()});
		
		var commandMenu = this.getCommandMenu();
		this.controller.setupWidget(Mojo.Menu.commandMenu , {menuClass: 'no-fade'} , {items: commandMenu});
		
		this.addAnchorFix();
		this.attachLoadImage();
	},
	
	activate: function()
	{
		//this.activateScrollTop();
		this.article.markAsRead();
		
		this.controller.setMenuVisible(Mojo.Menu.commandMenu , true);
	},
	
	deactivate: function()
	{
		this.controller.setMenuVisible(Mojo.Menu.commandMenu , false);
		//this.deactivateScrollTop();
	},
	
	cleanup: function()
	{
		this.removeAnchorFix();
		this.deattachLoadImage();
		this.article.abortRequests();
	},
	
	getArticleTemplate: function()
	{
		if (this.article.feed.type == "feed")
		{
			return "view-article/article";
		}
		else
		{
			return "view-article/articleFeedTitle";
		}
	},
	
	fixTopMarginForArticle: function()
	{
		var fixMe = this.controller.get('fixMe');
		var main = this.controller.get('main-header');
		var h = main.getHeight() + 10;
		fixMe.setStyle({marginTop: h+'px'});
	},
	
	handleCommand: function(event)
	{
		if (event.type == Mojo.Event.command) 
		{
			switch (event.command) 
			{
				case "previousArticle":
					return this.goToPreviousArticle();
				break;
				
				case "nextArticle":
					return this.goToNextArticle();
				break;
				
				case "articleLink":
					return this.goToArticleLink();
				break;
			}
		}
	},
	
	getCommandMenu: function()
	{
		this.setupNextPreviousArticles();
		this.setupLinkToArticle();
		var commandMenu = [];
		if (this.previousArticle)
		{
			commandMenu.push({ icon: "back", command: "previousArticle"});
		}
		else
		{
			commandMenu.push({});
		}
		
		if (this.articleLink)
		{
			commandMenu.push({ icon: 'info' , command: 'articleLink'});
		}
		else
		{
			commandMenu.push({});
		}
		
		if (this.nextArticle)
		{
			commandMenu.push({ icon: 'forward', command: 'nextArticle'});
		}
		else
		{
			commandMenu.push({});
		}
		return commandMenu;
	},
	
	setupNextPreviousArticles: function()
	{
		try
		{
			this.previousArticle = this.article.getPreviousArticle();
			this.nextArticle = this.article.getNextArticle();
		}
		catch(e)
		{
			Mojo.Log.error('+++++setupNextPreviousArticles' , Object.toJSON(e));
		}
	},
	
	setupLinkToArticle: function()
	{
		try
		{
			this.articleLink = this.article.getArticleLink();
		}
		catch(e)
		{
			Mojo.Log.error('++++++++setupLinkToArticle' , Object.toJSON(e));
			this.articleLink = false;
		}
	},
	
	goToNextArticle: function()
	{
		if (this.nextArticle)
		{
			this.controller.stageController.swapScene({name: 'view-article' , transition: Mojo.Transition.crossFade} , {article: this.nextArticle});
		}
	},
	
	goToPreviousArticle: function()
	{
		if (this.previousArticle)
		{
			this.controller.stageController.swapScene({name: 'view-article' , transition: Mojo.Transition.crossFade} , {article: this.previousArticle});
		}
	},
	
	goToArticleLink: function()
	{
		if (this.articleLink)
		{
			this.controller.serviceRequest('palm://com.palm.applicationManager' ,
            {
              method: 'open',
              parameters: {
                            id: 'com.palm.app.browser',
                            params: { target: this.articleLink }
                          }
            });
		}
	},
	
	loadFullImage: function(event)
	{
		var img = event.target || event.srcElement;
		this.controller.stageController.pushScene('display-pic' , {imageURL: img.src});
	},
	
	attachLoadImage: function()
	{
		var article = this.controller.get('article');
		var img , i=0;
		while (img = article.down('img' , i))
		{
			if (img)
			{
				img.observe(Mojo.Event.hold , this._loadFullImage);
			}
			i++;
		}
	},
	
	deattachLoadImage: function()
	{
		var article = this.controller.get('article');
		var img , i=0;
		while (img = article.down('img' , i))
		{
			if (img)
			{
				img.stopObserving(Mojo.Event.hold , this._loadFullImage);
			}
			i++;
		}
	},
	
	addAnchorFix: function()
	{
		var article = this.controller.get('article');
		var a , i=0;
		while (a = article.down('a' , i))
		{
			if (a)
			{
				a.observe('click' , this._anchorTap);
			}
			i++;
		}
		
		var scroller = this.controller.getSceneScroller();
		scroller.observe(Mojo.Event.dragStart , this._onDragging);
		scroller.observe(Mojo.Event.dragging , this._onDragging);
		scroller.observe(Mojo.Event.dragEnd , this._onDragEnd);
	},
	
	removeAnchorFix: function()
	{
		var article = this.controller.get('article');
		var a , i=0;
		while (a = article.down('a' , i))
		{
			if (a)
			{
				a.stopObserving('click' , this._anchorTap);
			}
			i++;
		}
		
		var scroller = this.controller.getSceneScroller();
		scroller.stopObserving(Mojo.Event.dragStart , this._onDragging);
		scroller.stopObserving(Mojo.Event.dragging , this._onDragging);
		scroller.stopObserving(Mojo.Event.dragEnd , this._onDragEnd);
	},
	
	anchorTap: function(event)
	{
		if (this.lastDrag && this.lastDrag > Delicious.getTimeStamp()-1)
		{
			event.preventDefault();
			event.stop();
			return false;
		}
	},
	
	onDragging: function(event)
	{
		this.lastDrag = Delicious.getTimeStamp();
	},
	
	onDragEnd: function(event)
	{
		this.lastDrag = Delicious.getTimeStamp();
	}

});