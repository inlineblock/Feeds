Feeds.Preferences = {
	getCount: function()
	{
		Feeds.Preferences.initAllPreferences();
		var count = Feeds.Preferences.settings.fetchCount || 25;
		switch (count.toString())
		{
			case '100':
				return 100;
			break;
			
			case '75':
				return 75;
			break;
			
			case '50':
				return 50;
			break;
			
			case '10':
				return 10;
			break;
				
			case '25':
			default:
				return 25;
			break;
		}
	},
	
	setCount: function(count)
	{
		Feeds.Preferences.initAllPreferences();
		Mojo.Log.info('pref set count: ' , count);
		switch (count.toString())
		{
			case '100':
				count = 100;
			break;
			
			case '75':
				count = 75;
			break;
			
			case '50':
				count = 50;
			break;
			
			case '10':
				count = 10;
			break;
				
			case '25':
			default:
				count = 25;
			break;
		}
		Mojo.Log.info('pref res count: ' , count);
		Feeds.Preferences.settings.fetchCount = count;
		Feeds.Preferences.saveAll();
	},
	
	initAllPreferences: function()
	{
		if (!Feeds.Preferences.cookie)
		{
			Feeds.Preferences.Cookie = new Mojo.Model.Cookie('feedsAllPreferences');
		}
		Feeds.Preferences.settings = Feeds.Preferences.Cookie.get();
		Feeds.Preferences.settings = Feeds.Preferences.settings || {};
	},
	
	saveAll: function()
	{
		Feeds.Preferences.Cookie.put(Feeds.Preferences.settings);
	},
	
	getAllUnreadSettings: function()
	{
		Feeds.Preferences.initAllPreferences();
		switch (Feeds.Preferences.settings.allUnread)
		{
			case 'unread':
				return 'unread';
			break;
			
			case 'starred':
				return 'starred';
			break;
				
			case 'all':
			default:
				return 'all';
			break;
		}
	},
	
	setAllUnreadSettings: function(setting)
	{
		switch(setting)
		{
			case 'unread':
				Feeds.Preferences.settings.allUnread = 'unread';
			break;
			
			case 'starred':
				Feeds.Preferences.settings.allUnread = 'starred';
			break;
				
			case 'all':
			default:
				Feeds.Preferences.settings.allUnread = 'all';
			break;
		}
		
		Feeds.Preferences.saveAll();
	},
	
	setDarkTheme: function(val)
	{
		var val = (val ? true : false);
		Feeds.Preferences.settings.darkTheme = val;
		Feeds.Preferences.saveAll();
		
	},
	
	getDarkTheme: function()
	{
		Feeds.Preferences.initAllPreferences();
		return (Feeds.Preferences.settings.darkTheme ? true : false);
	},
	
	/// LANDSCAPE
	
	getLandscapeSettings: function()
	{
		Feeds.Preferences.initAllPreferences();
		var settings = Feeds.Preferences.settings.landscape || {enabled:true,gestures:true} , ret = {};
		if (settings.enabled)
		{
			ret.enabled = true;
		}
		else
		{
			ret.enabled = false;
		}
		
		if (settings.gestures)
		{
			ret.gestures = true;
		}
		else
		{
			ret.gestures = false;
		}
		//Mojo.Log.info('-------getLandscapeSettings' , Object.toJSON(ret));
		return ret;
	},
	
	setLandscapeSettings: function(settings)
	{
		var set = {} , settings = settings || {};
		if (settings.enabled)
		{
			set.enabled = true;
		}
		else
		{
			set.enabled = false;
		}
		
		if (settings.gestures)
		{
			set.gestures = true;
		}
		else
		{
			set.gestures = false;
		}
		
		//Mojo.Log.info('-------setLandscapeSettings' , Object.toJSON(set));
		Feeds.Preferences.settings.landscape = set;
		Feeds.Preferences.saveAll();
	},
	
	/// OFFLINE STORAGE
	
	setOfflineSettings: function(settings)
	{
		var set = {} , settings = settings || {};
		if (settings.unreadOnly)
		{
			set.unreadOnly = true;
		}
		else
		{
			set.unreadOnly = false;
		}
		
		if (settings.fetchOnNotifications)
		{
			set.fetchOnNotifications = true;
		}
		else
		{
			set.fetchOnNotifications = false;
		}
		
		//Mojo.Log.info('-------setOfflineSettings' , Object.toJSON(set));
		Feeds.Preferences.settings.offline = set;
		Feeds.Preferences.saveAll();
	},
	
	getOfflineSettings: function()
	{
		Feeds.Preferences.initAllPreferences();
		var settings = Feeds.Preferences.settings.offline || {unreadOnly:true , fetchOnNotifications:false} , ret = {};
		
		if (settings.unreadOnly)
		{
			ret.unreadOnly = true;
		}
		else
		{
			ret.unreadOnly = false;
		}
		
		if (settings.fetchOnNotifications)
		{
			ret.fetchOnNotifications = true;
		}
		else
		{
			ret.fetchOnNotifications = false;
		}
		//Mojo.Log.info('-------getOfflineSettings' , Object.toJSON(ret));
		return ret;
	},
	
	/// NOTIFICATIONS
	
	getNotificationSettings: function()
	{
		Feeds.Preferences.initAllPreferences();
		var settings = Feeds.Preferences.settings.notifications || {enabled:true , interval:60} , ret = {};
		
		if (settings.enabled)
		{
			ret.enabled = true;
		}
		else
		{
			ret.enabled = false;
		}
		
		switch(settings.interval)
		{
			case 15:
				ret.interval = 15;
			break;
			
			case 30:
				ret.interval = 30;
			break;
			
			case 120:
				ret.interval = 120;
			break;
			
			case 360:
				ret.interval = 360;
			break;
			
			default:
				ret.interval = 60;
			break;
		}
		//Mojo.Log.info('-------getNotificationSettings' , Object.toJSON(ret));
		return ret;
	},
	
	setNotificationSettings: function(settings)
	{
		var set = {} , settings = settings || {};
		if (settings.enabled)
		{
			set.enabled = true;
		}
		else
		{
			set.enabled = false;
		}
		
		switch(parseInt(settings.interval))
		{
			case 15:
				set.interval = 15;
			break;
			
			case 30:
				set.interval = 30;
			break;
			
			case 120:
				set.interval = 120;
			break;
			
			case 360:
				set.interval = 360;
			break;
			
			default:
				set.interval = 60;
			break;
		}
		
		//Mojo.Log.info('-------setNotificationSettings' , Object.toJSON(set));
		Feeds.Preferences.settings.notifications = set;
		Feeds.Preferences.saveAll();
	}
};