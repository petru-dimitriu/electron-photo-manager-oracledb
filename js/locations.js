
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
        conts += "<tr class='searchable'><td>" + rows[i]['NAME'] + "</td> \
        <td> " + rows[i]['LATITUDE'] + "</td>\
    <td> " + rows[i]['LONGITUDE'] + "</td>\
    <td> <a href='javascript:displayPhotosWithLocation(\"" + rows[i]['NAME'] +"\")'>View</a> \
    <a href='javascript:removeLocationClick(" + rows[i]['ID'] + ")'>Remove</a></td>  \
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
      notify('Location ' + newLocationName + ' NOT added');
      alert('Some error prevented the location from being added. Checking the thrown exception might give you a clue as to what went wrong. ' + err);
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
                notify("Location not removed." + err);
            }
        });
}


function getLocationList(callback)
{
    var query = "SELECT * FROM locations";
        conn.all(query, function(err, rows){
                //console.log(rows);
            callback(rows);
        });
}
