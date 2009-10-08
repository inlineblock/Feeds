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
				
			case 'all':
			default:
				Feeds.Preferences.settings.allUnread = 'all';
			break;
		}
		
		Feeds.Preferences.saveAll();
	}
};