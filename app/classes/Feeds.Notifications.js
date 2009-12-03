Feeds.Notifications = Class.create({
	manager: false,
	initialize: function()
	{
		this.manager = Feeds.GoogleAccount.getManager();
	},
	
	spawn: function()
	{
		var notify = Feeds.Preferences.getNotificationSettings();
		if (!notify.enabled) return false;
		Feeds.Notifications.enable();
		if (!Feeds.GoogleAccount.isLoggedIn()) return false;
		var loginInfo = Feeds.GoogleAccount.getLogin();
		this.manager.login(loginInfo.email , loginInfo.password , this.loginComplete.bind(this));
	},
	
	loginComplete: function(t)
	{
		Mojo.Log.info('----loginComplete');
		if (!t) return this.closeNotifier();
		this.manager.getAllFeedsList(this.getAllFeedsCallBack.bind(this));
	},
	
	getAllFeedsCallBack: function(success)
	{
		Mojo.Log.info('----getAllFeedsCallBack');
		if (!success) return this.closeNotifier();
		this.manager.updateUnreadCount(this.getCountCallBack.bind(this));
	},
	
	getCountCallBack: function(success)
	{
		Mojo.Log.info('----getCountCallBack');
		if (!success) return this.closeNotifier();
		var feeds = this.manager.getFeeds();
		var num = 0;
		feeds.each(function(f){ num += f.getUnreadCount(); });
		
		
		
		if (Feeds.StageManager.stageExists(Feeds.Notifications.stageName))
		{
			Feeds.StageManager.close(Feeds.Notifications.stageName);
		}
		var offline = Feeds.Preferences.getOfflineSettings();
		if (offline.fetchOnNotifications)
		{
			Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id , {spawnBackup:true});
		}
		
		if (num <= 0) return false;
		
		Mojo.Log.info('------Feeds.Notifications::getCountCallBack -- UNREAD: ' , num);
		Feeds.StageManager.newDashboard(Feeds.Notifications.stageName , 'Notification' , {manager: this.manager , 'count': num});
	},
	
	closeNotifier: function()
	{
		Mojo.Log.info('------Feeds.Notifications::closeNotifier');
		window.close()
	}
	
});
Feeds.Notifications.stageName = 'notifications';
Feeds.Notifications.alarmKey = '_notifier';
Feeds.Notifications.enable = function()
{
	var notify = Feeds.Preferences.getNotificationSettings() , time;
	if (!notify.enabled) return false;
	
	if (notify.interval < 60)
	{
		time = "00:" + notify.interval + ":00";
	}
	else
	{
		var hour = Math.floor(notify.interval/60);
		time = "0" + hour + ":00:00";
	}
	
	var params = {'id': Mojo.Controller.appInfo.id , 'params':{checkForUpdates:true}};
	var request = new Mojo.Service.Request('palm://com.palm.power/timeout', {
		method: "set",
		parameters: {
			wakeup: true ,
			key: Feeds.Notifications.alarmKey ,
			uri: "palm://com.palm.applicationManager/launch",
			"params": params ,
			"in": time
			}
	});
}

Feeds.Notifications.disable = function()
{
	var notify = Feeds.Preferences.getNotificationSettings();
	if (notify.enabled) return false;
	
	var request = new Mojo.Service.Request('palm://com.palm.power/timeout', {
			method: "clear",
			parameters: { 'key': Feeds.Notifications.alarmKey }
	});
}

Feeds.Notifications.close = function()
{
	Feeds.StageManager.close(Feeds.Notifications.stageName);
}