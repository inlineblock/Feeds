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
			if (!this.imageURL) return this.controller.stageController.popScene();
			
			this._orientation = this.controller.stageController.getAppController().getScreenOrientation();
			
			if (!this.imageURL)
			{
				this.controller.stageController.popScene();
			}
			
			this.flipviewElement = this.controller.get('image_flipview_full');
			this.fullscreener = this.controller.get('fullscreener');
			this.controller.setupWidget('image_flipview_full' , {} , {});
			
			this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true} , { visible: true, items: [{ label: $L('Save Photo'), command: 'savePhoto' }]});
		
		}
		catch(e)
		{
			Mojo.Log.error('------ , ' , Object.toJSON(e));
		}
	},
	
	cleanup: function()
	{
		
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
					this.downloadImage();
				    
				break;
			}
		}
	},
	
	downloadImage: function()
	{
		var imgurl = this.imageURL.replace(' ' , '%20'),
			targetFilename = Delicious.getTimeStamp() + "_img." + imgurl.substr(-3),
			targetFolder = '/media/internal/' + Mojo.Controller.appInfo.title.replace(' ' , '_') + '/';
		try
    	{
    		this.controller.serviceRequest('palm://com.palm.downloadmanager/', 
    		{
    			method: 'download',
    			parameters: {
    					target: imgurl,
    					targetDir: targetFolder,
    					targetFilename: targetFilename,
    					keepFilenameOnRedirect: false,
    					subscribe: false
    				     },
    			onSuccess: Mojo.doNothing,		
    			onFailure: Mojo.doNothing
    		})
    	}	
    	catch(e)
    	{}
    	
    	try
    	{
    		this.controller.serviceRequest('palm://com.palm.downloadmanager/',
    		{
    			method: 'download',
    			parameters: {
    					target: imgurl,
    					targetDir: targetFolder,
    					targetFilename: targetFilename,
    					keepFilenameOnRedirect: false,
    					subscribe: true
    				    },
				onSuccess: this.downloadResponse.bind(this),
         		onFailure: Mojo.doNothing
    		})
    	}	
    	catch(e)
    	{}
	},
	
	downloadResponse: function(response)
	{
		if (response.completed)
		{
			this.controller.showBanner({messageText: "Image saved successfully." , icon: "Feeds"} , {} , "Feeds");
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