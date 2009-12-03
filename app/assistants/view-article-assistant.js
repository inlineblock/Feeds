ViewArticleAssistant = Class.create(Delicious.Assistant , {
	article: false,
	
	previousArticle: false,
	nextArticle: false,
	articleLink: false,
	
	dragLocation: false,
	lastDrag: false,
	
	initialize: function(o)
	{
		o = o || {};
		this.article = o.article;
		
		this._loadFullImage = this.loadFullImage.bindAsEventListener(this);
		this._anchorTap = this.anchorTap.bindAsEventListener(this);
		this._onDragStart = this.onDragStart.bindAsEventListener(this);
		this._onDragging = this.onDragging.bindAsEventListener(this);
		this._onDragEnd = this.onDragEnd.bindAsEventListener(this);
		this._onMouseUp = this.onMouseUp.bindAsEventListener(this);
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
		
		this.renderArticle();
		
		var commandMenu = this.getCommandMenu();
		this.controller.setupWidget(Mojo.Menu.commandMenu , {menuClass: 'no-fade'} , {items: commandMenu});
	},
	
	renderArticle: function()
	{
		var insertHere = this.controller.get('insertHere');
		insertHere.innerHTML = Mojo.View.render({object: this.article , template: this.getArticleTemplate()});
		insertHere.className = this.article.className;
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
				
				case "share":
					return this.shareArticle();
				break;	
				
				case "star":
					Mojo.Log.info('--handleCommand::star');
					return this.checkStarArticle();
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
		if (!this.isOffline())
		{
			commandMenu.push({ iconPath: 'images/starItem.png' , command: 'star'});
			commandMenu.push({ iconPath: 'images/share.png' , command: 'share'});
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
		scroller.observe(Mojo.Event.dragStart , this._onDragStart);
		scroller.observe(Mojo.Event.dragging , this._onDragging);
		scroller.observe(Mojo.Event.dragEnd , this._onDragEnd);
		scroller.observe('mouseup' , this._onMouseUp);
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
		scroller.stopObserving(Mojo.Event.dragStart , this._onDragStart);
		scroller.stopObserving(Mojo.Event.dragging , this._onDragging);
		scroller.stopObserving(Mojo.Event.dragEnd , this._onDragEnd);
		scroller.stopObserving('mouseup' , this._onMouseUp);
	},
	
	anchorTap: function(e)
	{
		if (this.lastDrag && this.lastDrag > Delicious.getTimeStamp()-1)
		{
			e.preventDefault();
			e.stop();
			return false;
		}
	},
	
	onDragStart: function(e)
	{
		this.lastDrag = Delicious.getTimeStamp();
		this.dragLocation = {start: {x:e.move.clientX , y:e.move.clientY , timeStamp: this.lastDrag}};
	},
	
	onDragging: function(e)
	{
		
		this.lastDrag = Delicious.getTimeStamp();
		
		if (this.dragLocation && this.dragLocation.start && Math.abs(e.move.clientY - this.dragLocation.start.y) > 80)
		{
			this.dragLocation = false;
		}
		else
		{
			this.dragLocation.last = {x:e.move.clientX , y:e.move.clientY , timeStamp: this.lastDrag};
		}
		
	},
	
	onMouseUp: function(e)
	{
		if (!this.dragLocation || Math.abs(this.dragLocation.last.y - this.dragLocation.start.y) > 80)
		{
			this.dragLocation = false;
			return;
		}
		
		if (Math.abs(this.dragLocation.last.x - this.dragLocation.start.x) > 120 && (this.dragLocation.last.timeStamp-2) < this.dragLocation.start.timeStamp)
		{
			if ((this.dragLocation.last.x - this.dragLocation.start.x) > 0)
			{
				this.goToPreviousArticle();
			}
			else
			{
				
				this.goToNextArticle();
			}
		}
		else
		{
			this.dragLocation = false;
		}
	},
	
	onDragEnd: function(e)
	{
		this.lastDrag = Delicious.getTimeStamp();
		
		this.onMouseUp(e);
	},
	
	checkStarArticle: function()
	{
		this.showLoader();
		if (this.article.isStarred())
		{
			Mojo.Log.info('--checkStarArticle::unmarkAsStarred');
			this.questionDialog('Remove Star' , "Are you sure you'd like to unstar this article?" , 'Yes, unstar it.' , 'negative', 'cancel' , '' , this.removeStarConfirm.bind(this))
		}
		else
		{
			Mojo.Log.info('--checkStarArticle::markAsStarred');
			this.article.markAsStarred(this.addStarCallBack.bind(this));
		}
	},
	
	removeStarConfirm: function(remove)
	{
		if (remove)
		{
			this.article.unmarkAsStarred(this.removeStarCallBack.bind(this));
		}
		else
		{
			this.hideLoader();
		}
	},
	
	addStarCallBack: function(success)
	{
		Mojo.Log.info('--addStarCallBack::' , success);
		this.hideLoader();
		this.renderArticle();
	},
	
	removeStarCallBack: function(success)
	{
		Mojo.Log.info('--removeStarCallBack::' , success);
		this.hideLoader();
		this.renderArticle();
	},
	
	shareArticle: function()
	{
		this.controller.showAlertDialog({
			    onChoose: this.shareArticleCallBack.bind(this) ,
			    title: "Share This Article",
			    message: "How would you like to share this article?",
			    choices:[
			         {label:$L("Email") , value:'email' , type:'none'},
			         {label:$L("IM\\SMS") , value:'sms' , type:'none'},
			         {label:$L("cancel") , value:false , type:'dismiss'},
			    ]
			   });
	},
	
	shareArticleCallBack: function(type)
	{
		switch(type)
		{
			case 'email':
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					 method:'open',
					 parameters:{  id: 'com.palm.app.email',
					 				params: { summary: this.article.title , text:this.article.title + "  \
					 				\
					 				" + this.article.getArticleLink()}
					 			 }
					});
			break;
			
			case 'sms':
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					 method:'open',
					 parameters:{  id: 'com.palm.app.messaging',
					 				params: { messageText:this.article.title + "  \
					 				\
					 				" + this.article.getArticleLink()}
					 			 }
					});
			break;
			
			case 'twitter':
			
			break;
			
			default:
				return false;
			break;
		}
	}

});