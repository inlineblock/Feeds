Feeds.GoogleAuth = Class.create({
	SID: false,
	
	initialize: function()
	{
		this.loginCookie = new Mojo.Model.Cookie('google-authentication-information');
		this.sidHandler = new Mojo.Model.Cookie('google-authentication-SID');
	},
	
	isLoggedIn: function()
	{
		var info = this.loginCookie.get();
		if (!info || !info.email || !info.password)
		{
			return false;
		}
		return true;
	},
	
	getLogin: function()
	{
		var info = this.loginCookie.get();
		if (!info || !info.email || !info.password)
		{
			return false;
		}
		
		var obj = {'email': info.email};
		obj.password = this.decryptPassword(info.hash , info.password);
		return obj;
	},
	
	login: function(email , password , callBack)
	{
		this.email = email;
		this.password = password;
		
		var callBack = callBack || Mojo.doNothing;
		var params = {method: 'post' , onSuccess: this.loginSuccess.bind(this , callBack) , onFailure: this.loginFailure.bind(this , callBack)};
		params.parameters = {Email: email , Passwd: password};
		this.ajaxRequest = new Ajax.Request('https://www.google.com/accounts/ClientLogin' , params);
	},
	
	loginSuccess: function(callBack , t)
	{
		if (t.status != 200 || t.responseText.indexOf('SID=') == -1) return callBack(false);
		var start = t.responseText.indexOf('SID=') + 4;
		var end = t.responseText.indexOf('LSID=') - 5;
		this.SID = t.responseText.substr(start , end);
		callBack(true);
	},
	
	loginFailure: function(callBack)
	{
		callBack(false);
	},
	
	saveLogin: function(email , password)
	{
		var obj = {'email': email};
		obj.hash = this.createHash();
		obj.password = this.encryptPassword(obj.hash , password);
		this.loginCookie.put(obj);
	},
	
	encryptPassword: function(hash , password)
	{
		if (window.PalmSystem.encrypt)
		{
			return Mojo.Model.encrypt(hash , password);
		}
		else
		{
			return password;
		}
	},
	
	decryptPassword: function(hash , encrypted_pass)
	{
		if (window.PalmSystem.encrypt)
		{
			return Mojo.Model.decrypt(hash , encrypted_pass);
		}
		else
		{
			return encrypted_pass;
		}
	},
	
	createHash: function(len)
	{
		var len = len || 12;
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		
		var randomString = '';
		for (var i=0; i < len; i++) 
		{
			var rnum = Math.floor(Math.random() * chars.length);
			randomString += chars.substring(rnum,rnum+1);
		}
		
		return randomString;
	},
	
	getManager: function()
	{
		var manager = new Feeds.GoogleManager();
		var loginInfo = this.getLogin();
		
		if (this.SID)
		{
			manager.setLogin(loginInfo.email , loginInfo.password);
			manager.setSID(this.SID);
		}
		
		return manager;
	},
	
	logout: function()
	{
		this.loginCookie.put(false);
		this.sidHandler.put(false);
	}
});