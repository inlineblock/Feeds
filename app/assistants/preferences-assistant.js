PreferencesAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this._onSettingChange = this.onSettingChange.bindAsEventListener(this);
		this._onThemeChange = this.onThemeChange.bindAsEventListener(this);
		
		this._landscapeChange = this.landscapeChange.bindAsEventListener(this);
		this._notificationsChange = this.notificationsChange.bindAsEventListener(this);
		this._offlineChange = this.offlineChange.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.countSelectorModel = {value: Feeds.Preferences.getCount() };
		this.controller.setupWidget("countSelector", {label: $L('Articles') , choices: [{label: '10' , value: 10} , {label: '25' , value: 25} , {label: '50' , value: 50} , {label: '75' , value: 75} , {label: '100' , value: 100}]} , this.countSelectorModel);
		
		
		
		
		this.darkThemeModel = {value: Feeds.Preferences.getDarkTheme()};
		this.controller.setupWidget('darkThemeToggle' , { trueValue: true , falseValue: false } , this.darkThemeModel);
		
		
		
		var landscape = Feeds.Preferences.getLandscapeSettings();
		this.landscapeModeModel = {value: landscape.enabled};
		this.controller.setupWidget('landscapeModeToggle' , { trueValue: true , falseValue: false } , this.landscapeModeModel);
		this.scrollGesturesModel = {value: landscape.gestures};
		this.controller.setupWidget('scrollGesturesToggle' , { trueValue: true , falseValue: false } , this.scrollGesturesModel);
		
		
		
		var notify = Feeds.Preferences.getNotificationSettings();
		this.notificationsEnabledModel = {value: notify.enabled};
		this.controller.setupWidget('enableNotificationsToggle' , { trueValue: true , falseValue: false } , this.notificationsEnabledModel);
		this.notificationsIntervalModel = {value: notify.interval};
		this.controller.setupWidget("notificationInterval", {label: $L('Check Interval') , choices: [{label: $L('15 Minutes') , value: 15} , {label: $L('30 Minutes') , value: 30} , {label: $L('1 Hour') , value: 60} , {label: $L('2 Hours') , value: 120} , {label: $L('6 Hours') , value: 360}]} , this.notificationsIntervalModel);
		
		
		var offline = Feeds.Preferences.getOfflineSettings();
		this.offlineUnreadModel = {value: offline.unreadOnly};
		this.controller.setupWidget('offlineUnreadToggle' , { trueValue: true , falseValue: false } , this.offlineUnreadModel);
		this.offlineFetchNotficationsModel = {value: offline.fetchOnNotifications};
		this.controller.setupWidget('offlineNotificationToggle' , { trueValue: true , falseValue: false } , this.offlineFetchNotficationsModel);
		
		
		

	},
	
	activate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.observe(Mojo.Event.propertyChange, this._onSettingChange);
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.observe(Mojo.Event.propertyChange, this._onThemeChange);
		
		var landscapeModeToggle = this.controller.get('landscapeModeToggle');
		landscapeModeToggle.observe(Mojo.Event.propertyChange, this._landscapeChange);
		var scrollGesturesToggle = this.controller.get('scrollGesturesToggle');
		scrollGesturesToggle.observe(Mojo.Event.propertyChange, this._landscapeChange);
		
		var enableNotificationsToggle = this.controller.get('enableNotificationsToggle');
		enableNotificationsToggle.observe(Mojo.Event.propertyChange, this._notificationsChange);
		var notificationInterval = this.controller.get('notificationInterval');
		notificationInterval.observe(Mojo.Event.propertyChange, this._notificationsChange);
		
		var offlineUnreadToggle = this.controller.get('offlineUnreadToggle');
		offlineUnreadToggle.observe(Mojo.Event.propertyChange, this._offlineChange);
		var offlineNotificationToggle = this.controller.get('offlineNotificationToggle');
		offlineNotificationToggle.observe(Mojo.Event.propertyChange, this._offlineChange);
	},
	
	deactivate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.stopObserving(Mojo.Event.propertyChange, this._onSettingChange);
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.stopObserving(Mojo.Event.propertyChange, this._onThemeChange);
		
		var landscapeModeToggle = this.controller.get('landscapeModeToggle');
		landscapeModeToggle.stopObserving(Mojo.Event.propertyChange, this._landscapeChange);
		var scrollGesturesToggle = this.controller.get('scrollGesturesToggle');
		scrollGesturesToggle.stopObserving(Mojo.Event.propertyChange, this._landscapeChange);
		
		var enableNotificationsToggle = this.controller.get('enableNotificationsToggle');
		enableNotificationsToggle.stopObserving(Mojo.Event.propertyChange, this._notificationsChange);
		var notificationInterval = this.controller.get('notificationInterval');
		notificationInterval.stopObserving(Mojo.Event.propertyChange, this._notificationsChange);
		
		var offlineUnreadToggle = this.controller.get('offlineUnreadToggle');
		offlineUnreadToggle.stopObserving(Mojo.Event.propertyChange, this._offlineChange);
		var offlineNotificationToggle = this.controller.get('offlineNotificationToggle');
		offlineNotificationToggle.stopObserving(Mojo.Event.propertyChange, this._offlineChange);
		
	},
	
	cleanup: function()
	{
	
	},
	
	onSettingChange: function()
	{
		Feeds.Preferences.setCount(this.countSelectorModel.value);
	},
	
	onThemeChange: function()
	{
		var val = this.darkThemeModel.value;
		Feeds.Preferences.setDarkTheme(val);
		if (val)
		{
			this.controller.getSceneScroller().up('body').addClassName('palm-dark');
		}
		else
		{
			this.controller.getSceneScroller().up('body').removeClassName('palm-dark');
		}
	},
	
	landscapeChange: function()
	{
		var settings = {enabled: this.landscapeModeModel.value , gestures: this.scrollGesturesModel.value};
		Feeds.Preferences.setLandscapeSettings(settings);
	},
	
	notificationsChange: function()
	{
		var settings = {enabled: this.notificationsEnabledModel.value , interval: this.notificationsIntervalModel.value};
		Feeds.Preferences.setNotificationSettings(settings);
		
		if (settings.enabled)
		{
			Feeds.Notifications.enable();
		}
		else
		{
			Feeds.Notifications.disable();
		}
	},
	
	offlineChange: function()
	{
		var settings = {unreadOnly: this.offlineUnreadModel.value , fetchOnNotifications: this.offlineFetchNotficationsModel.value};
		Feeds.Preferences.setOfflineSettings(settings);
	},
	
	handleCommand: function()
	{
		
	}

});