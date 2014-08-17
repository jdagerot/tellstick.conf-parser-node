var fs = require('fs');


function sectionObject(name) {
	console.info("Created new section, name:" + name);
	this.name = name;
	this.data = {};
}

function getProperObject(obj) {
	var nbr = parseFloat(obj);
	return !isNaN(nbr) ? nbr : obj.replace(/\"/g, '');


}

var devices = {};
fs.readFile('./tellstick.conf', function(err, data) {
	if (err) console.error(err);
	var array = data.toString().split("\n");
	var root = {
		devices: []
	};
	var deep = 0;
	var device = null;
	var section = null;
	for (i in array) {
		var line = array[i];
		line.replace(/  /g, ' '); // Remove double spaces and tabs
		//	console.log(i + ": " + array[i]);
		if (line.trim().length > 0) {
			console.log(line);
			// We have a section start	
			if (line.indexOf("{") > -1) {
				var name = line.substring(0, line.indexOf("{") - 1).trim();
				var value = getProperObject(line.substring(1 + line.indexOf("{")).trim());
				if (name === "device") {
					console.info("Creating a device");
					device = {};
				} else {
					console.info("Creating a section:" + name);
					section = new sectionObject(name);
				}
			} else
			if (line.indexOf("}") > -1) {
				if (section == null) {
					// We are ending an device
					root.devices.push(device);
					device = null;
				} else { // We are ending a section
					if (device != null) {
						device[section.name] = section.data;
						section = null;
					} else {
						root[section.name] = section.data;
						section = null;
					}

				}
			} else {
				var keyValuePair = line.split("=");
				var key = keyValuePair[0].trim();
				var value = getProperObject(keyValuePair[1].trim());
				//console.info("keyValue = " + keyValue);
				if (key.indexOf("#") !== 0) {
					if (section != null) {
						section.data[key] = value;
					} else if (device != null) {
						device[key] = value;
					} else {
						root[key] = value;
					}
				}
			}
		}
	}
	//	console.dir(root);
	fs.writeFile('tellstick.json', JSON.stringify(root, null, 4));
});