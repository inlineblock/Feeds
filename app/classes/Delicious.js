console = console || {};
 console.log = console.log || function(){ apply(console.delicious , $A(arguments)); };
 console.dir = console.dir || function(){ apply(console.delicious , $A(arguments)); };
// console.delicious = function() { args = $A(arguments); for(var i=0; i< args.length; i++) { if (!Object.isString(args[i])) { args[i] = Object.toJSON(args[i]); }} apply(Mojo.Log.info , args);  }
Delicious = {
	getTimeStamp: function()
	{
		var d = new Date();
		return Math.floor(d.getTime()/1000);
	}
};


String.prototype.trim = function() 
{
	var	str = this.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}
String.prototype.localize = function()
{
	return $L(this);
}