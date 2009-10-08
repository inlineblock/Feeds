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
					var onSuccess = this.onSuccessPhotoSave.bind(this);
					var onFailure = this.onFailurePhotoSave.bind(this);
					var imgurl = this.imageURL;
					var mimeExt = this.imageURL.substring(this.imageURL.length - 3 , this.imageURL.length);
					this._downloadRequest = new Mojo.Service.Request('palm://com.palm.downloadmanager', {
							method: 'download',
						parameters: {
							'target': imgurl,
							'targetDir': '/media/internal/downloads',
							'mime': 'image/' + mimeExt
							},
						'onSuccess': onSuccess,
						'onFailure': onFailure
					});
				    
				break;
			}
		}
	},
	
	onSuccessPhotoSave: function(e)
	{
		Mojo.Log.info("PhotoSAVE----" , Object.toJSON(e));
		var banner = this.controller.showBanner({messageText: "Photo saved successfully." , icon: "Feeds"} , {} , "Feeds");
	},
	
	onFailurePhotoSave: function()
	{
		var banner = this.controller.showBanner({messageText: "Unable to save photo. " , icon: "Feeds"} , {} , "Feeds");
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