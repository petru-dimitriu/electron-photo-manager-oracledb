
function displayLocation()
{
	changeMode("Location");
	loadLocationIntoContents();
}

function loadLocationIntoContents()
{
	getLocationList(getLocationListAsTable);
}

function getLocationListAsTable(rows)
{
	var conts = "<table> \
	<tr id='insertRow'><td colspan='1'>\
  <input id='incrementalSearchValLoc' style='width:100%;' placeholder = 'Type here to search or insert new Location.'> \
	</td> \
  <td> <input id ='latitude'> </td> \
  <td> <input id ='longitude'> </td> \
  </tr>";

	for (var i = 0; i < rows.length; i ++)
	{
		conts += "<tr class='searchable'><td>" + rows[i]['name'] + "</td> \
		<td> " + rows[i]['latitude'] + "</td>\
    <td> " + rows[i]['longitude'] + "</td>\
    <td> <a href='javascript:displayPhotosWithLocation(\"" + rows[i]['name'] +"\")'>View</a> \
    <a href='javascript:removeLocationClick(" + rows[i]['id'] + ")'>Remove</a></td>  \
		</tr>";
	}
	conts += "</table>";
	$("#conts").html(conts);
	$("#incrementalSearchValLoc").keydown(tableInputKeydownLoc);
	$("#latitude").keydown(tableInputKeydownLoc);
	$("#longitude").keydown(tableInputKeydownLoc);
}

function tableInputKeydownLoc(event)
{
	if (event.which == 13)
	{
		var newLocationName = $('#incrementalSearchValLoc').val();
    var newLocationLat = $('#latitude').val();
    var newLocationLong = $('#longitude').val();
		insertLocation(newLocationName, newLocationLat, newLocationLong,
			function(err)
		{
      if (err == null)
      {
  			loadLocationIntoContents();
  			notify('Location ' + newLocationName + ' added');
    }
    else
    {
      notify('Location ' + newLocationName + ' NOT added. Check constraints!');
    }
		});
	}
	else
		incrementalSearchTable();
}


function removeLocationClick(id)
{
	removeLocation(id,
		function(err){
			if (err == null)
			{
				notify("Location removed.");
				loadLocationIntoContents();
			}
			else
			{
				notify("Location not removed.");
			}
		});
}


function getLocationList(callback)
{
	var query = "SELECT * FROM locations";
	db.serialize(function(){
		db.all(query, function(err, rows){
				//console.log(rows);
			callback(rows);
		});
	});
}
