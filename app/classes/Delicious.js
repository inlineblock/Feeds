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