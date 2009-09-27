DisplayPicAssistant = Class.create(Delicious.Assistant , {
	
	imageURL: false,
	title: false,
	
	img: false,
	scroller: false,
	orientation: false,
	activated: false,
	
	loaded: false,
	
	initialize: function(o)
	{
		o = o || {};
		this.imageURL = o.imageURL || false;
		this.title = o.title || false;
		
		this._provideURL = this.provideURL.bindAsEventListener(this);
	},
	
	setup: function()
	{
		try
		{
		if (!this.imageURL) this.controller.stageController.popScene();
		
		this._orientation = this.controller.stageController.getAppController().getScreenOrientation();
		this.controller.enableFullScreenMode(true);
		
		if (!this.imageURL)
		{
			this.controller.stageController.popScene();
		}
		
		this.flipviewElement = this.controller.get('image_flipview_full');
		this.fullscreener = this.controller.get('fullscreener');
		this.controller.setupWidget('image_flipview_full' , {} , {});
		
		}
		catch(e)
		{
			Mojo.Log.error('------ , ' , Object.toJSON(e));
		}
	},
	
	cleanup: function()
	{
		this.controller.enableFullScreenMode(false);
	},
	
	resetSizing: function()
	{
		var w = this.fullscreener.offsetWidth;
		var h = this.fullscreener.offsetHeight;
		Mojo.Log.info('sizing infomration: ' , w , h);
		this.flipviewElement.mojo.manualSize(w , h);
	},
	
	handleCommand: function(event)
	{
		if(event.type == Mojo.Event.command) 
		{
			switch(event.command)
			{
				case 'savePhoto':
					var downloadResponse = this.downloadResponse.bind(this);
					var imgurl = this.imageURL.replace(' ' , '%20');
					var downloadRequest = new Mojo.Service.Request('palm://com.palm.downloadmanager', {
						method: 'download',
						parameters:
						{
							'target': imgurl ,
							'targetDir': '/media/internal/wallpapers',
							'subscribe': false
						},
						onSuccess: downloadResponse ,
						onFailure: downloadResponse
					});
				    
				break;
			}
		}
	},
	
	downloadResponse: function(response)
	{
		var banner;
		if (response.completed)
		{
			banner = this.controller.showBanner({messageText: "Photo saved successfully." , icon: "feeds"} , {} , "feeds");
			return;
		}
		
		if (response.completionStatusCode)
		{
			banner = this.controller.showBanner({messageText: "status. " + response.completionStatusCode , icon: "feeds"} , {} , "feeds");
			return;
		}
	},
	
	activate: function(event)
	{
		var img = new Image();
		img.onload = this._provideURL;
		img.src = this.imageURL;
	},
	
	deactivate: function(event)
	{
		
	},
	
	provideURL: function()
	{
		this.loaded = true;
		this.flipviewElement.removeClassName('loading');
		this.flipviewElement.mojo.centerUrlProvided(this.imageURL);
		this.resetSizing();
	},
	
	orientationChanged: function(orientation)
	{
		if (this._orientation === orientation) return;
		
		this._orientation = orientation;
		this.controller.window.PalmSystem.setWindowOrientation(this._orientation);
		this.resetSizing();
	}

});