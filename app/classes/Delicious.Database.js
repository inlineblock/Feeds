Delicious = Delicious || {};
Delicious.Database = Class.create({
	// DEFINES: This information is the default database information, you probably want it filled out for short hand reasons.
	_dbShortName: "twee",
	_dbVersion: "1.0",
	_dbDisplayName: "TweeDB",
	_dbMaxSize: "65536", // this is bytes
	
	
	dbConnection: false,
	query: false,
	insertID: false,
	count: false,
	error: false,
	errorMsg: false,
	errorCode: false,
	args: false,
	callBack: false,
	
	// DO NOT CHANGE ANYHTING BELOW THIS ONE
	transaction: false,
	rowData: false,
	
	initialize: function(o)
	{
		// Setup the database connection information.
		// Obviously if you use more than one database you need to define it, otherwise its quicker to use the defaults defines above
		Twee.dbConn = Twee.dbConn || [];
		
		var o = o || {};
		this._dbShortName = o.shortName || this._dbShortName;
		this._dbVersion = o.version || this._dbVersion;
		this._dbDisplayName = o.displayName || this._dbDisplayName;
		this._dbMaxSize = o.maxSize || this._dbMaxSize;
		
		if (Twee.dbConn && Twee.dbConn[this._dbShortName])
		{
			this.dbConnection = Twee.dbConn[this._dbShortName];
		}
		else
		{
			db = openDatabase(this._dbShortName , this._dbVersion , this._dbDisplayName, this._dbMaxSize);
			
			if (db)
			{
				Twee.dbConn[this._dbShortName] = db;
				this.dbConnection = db;
			}
		}
	},
	
	setQuery: function(query , argArray)
	{
		this.clearExistingInformation();
		this.query = query;
		this.args = argArray || [];
	},
	
	execute: function(callBack)
	{
		if (!this.dbConnection) return false;
		query = this.query;
		argArray = this.args;
		this.callBack = callBack || function() {};
		
		var dh = this.dataHandler.bind(this);
		var eh = this.errorHandler.bind(this);
		this.dbConnection.transaction( function(t) {
			t.executeSql(query , argArray , dh , eh);
		});
	},
	
	clearExistingInformation: function()
	{
		this.query = false;
		this.args = false;
		this.insertID = false;
		this.count = false;
		this.rowsAffected = false;
		this.transaction = false;
		this.rowData = false;
		this.errorMsg = false;
		this.errorCode = false;
	},
	
	close: function()
	{
		if (this.dbConnection)
		{
			this.dbConnection.close();
		}
	},
	
	errorHandler: function(t , e)
	{
		
		this.transaction = t;
		this.error = true;
		this.success = false;
		this.errorMsg = e.message + "";
		this.errorCode = e.code;
		this.callBack(this , {error: true , success: false});
	},
	
	dataHandler: function(t , r)
	{
		this.transaction = t;
		this.rowData = r;
		this.error = false;
		this.success = true;
		this.callBack(this , {success: true , error: false});
	},
	
	getInsertID: function()
	{
		return this.rowData.insertId || false;
	},
	
	getRowsAffected: function()
	{
		return this.rowData.rowsAffected;
	},
	
	getCount: function()
	{
		return this.rowData.rows.length;
	},
	
	getAll: function()
	{
		var allData = [];
		if (this.rowData && this.rowData.rows && this.rowData.rows.length)
		{
			for(var i =0; i < this.rowData.rows.length; i++)
			{
				allData.push(this.rowData.rows.item(i));
			}
		}
		return allData;
	}
	
});