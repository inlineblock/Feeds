AppAssistant = Class.create({
	appState: false,
	
	initialize: function(appController)
	{
		this.nduid  = new Mojo.Model.Cookie('nduid');
	},
	
	setup: function()
	{
		Feeds.StageManager = new Delicious.StageManager(this.controller);
		Feeds.GoogleAccount = new Feeds.GoogleAuth();
		this.fireTracking();
		this.checkForUpdate();
	},
	
	handleLaunch: function(o)
	{
		Mojo.Log.info('--appAssistant::handleLaunch timeStamp: ' , Delicious.getTimeStamp());
		//if (Delicious.getTimeStamp() > 1257745187) return;
		var o = o || {};
		if (o.checkForUpdates)
		{
			Mojo.Log.info('-----checkForUpdates');
			var notify = new Feeds.Notifications();
			notify.spawn();
		}
		else
		{
			Feeds.StageManager.newCard('main' , 'main' , {initialLaunch: true});
		}
	},
	
	cleanup: function(o)
	{
		// fires when the application is done.
		Mojo.Log.info('--appAssistant::cleanup timeStamp: ' , Delicious.getTimeStamp());
	},
	
	fireTracking: function()
	{
		var s = s_gi(Mojo.Controller.appInfo.reportSuite);
		s.pageName = Mojo.Controller.appInfo.title + " Launched";
		s.prop1 = Mojo.Controller.appInfo.title;
		s.eVar1 = Mojo.Controller.appInfo.title;
		s.prop2 = Mojo.Controller.appInfo.version;
		s.eVar2 = Mojo.Controller.appInfo.version;
		s.prop3 = "Palm Pre";
		s.eVar3 = "Palm Pre";
		var nduid = this.nduid.get();
		if (nduid)
		{
			s.vID = nduid;
		}
		else
		{
			new Mojo.Service.Request('palm://com.palm.preferences/systemProperties', {
		   		method:"Get",
		   		parameters:{"key": "com.palm.properties.nduid" },
		  		onSuccess: this.storeNduid.bind(this)
			});
		}
		s.t();		
	},
	
	storeNduid: function(id)
	{
		this.nduid.put(id['com.palm.properties.nduid']);
	},
	
	checkForUpdate: function()
	{
		this.appState = new Mojo.Model.Cookie('application_state');
		var info = this.appState.get();
		if (!info)
		{
			this.firstLaunch();	
		}
		else if (info && info.lastVersion && info.lastVersion < Mojo.Controller.appInfo.version)
		{
			this.updateLaunch(info.lastVersion);
		}
		else
		{
			// its been ran and its the same version.
		}
		this.updateApplicationState();
	},
	
	firstLaunch: function()
	{
		
	},
	
	updateLaunch: function(mrv) // passes in most recent version
	{
		
	},
	
	updateApplicationState: function()
	{
		var info = this.appState.get();
		if (!info)
		{
			info = {};
		}
		
		info.lastVersion = Mojo.Controller.appInfo.version;
		this.appState.put(info);
	}

});