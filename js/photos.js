
function displayCurrentPhotoWindow()
{
    var numPhotos = -1;
    contents = "";
    for (var i = currentPhotoWindowFirstIndex; i < currentPhotoWindowFirstIndex + photosPerPage  && i < currentPhotoList.length; i++) {
        if (currentPhotoList[i] == null)
            continue;
        numPhotos++;
        if ((numPhotos % 5) === 0) {
            contents += "<tr class='imgrow'>";
        }

        var shortTitle = currentPhotoList[i]['PATH'].substr(currentPhotoList[i]['PATH'].lastIndexOf("/")+1);

        contents +=
          "<td style='background-image: url(\""  + currentPhotoList[i]['PATH'] + "\")' onclick='javascript:displayPhoto(" + i + ")'>" +
            "<a href='javascript:displayPhoto(" + i + ")'>" +
            "<div id='photoDesc" + numPhotos + "' class = \"photoDesc\"> " + shortTitle + " </div>" +
            "</a>" +
            "</td>";

        if (((numPhotos+1) % 5) === 0) {
            contents += "</tr>";
        }
    }
    if ((numPhotos+1)%5 != 0)
        contents += "</tr>";
    contents += "</table>";
    $("#conts").html(contents);
}


function displayPhotos(albumId, albumTitle, query)
{
    currentMode = "album";
    if (albumTitle == null)
        $('#title').html('Search results');
    else
        $('#title').html(albumTitle);

    $('#albumViewerCommands').css('display','block');
    if (query == null)
        query = "SELECT id, path, description, album_id, rating, location_id, to_char(date_taken,'DD/MM/YYYY') date_taken FROM photos WHERE album_id = " + albumId;
    contents = "<table>";
    conn.all(query, function(err, data) {
        currentPhotoList = data;
        currentPhotoIndex = 0;
        currentPhotoWindowFirstIndex = 0;
        displayCurrentPhotoWindow();
    });
}

function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 5,
          center: mapLocations[0],
          mapTypeId: 'terrain'
        });

        // Define a symbol using a predefined path (an arrow)
        // supplied by the Google Maps JavaScript API.
        var lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };

		var marker = new google.maps.Marker({
		position: mapLocations[0],
		icon: {
		  path: google.maps.SymbolPath.CIRCLE,
		  scale: 10
		},
		draggable: true,
		map: map
	  });

  
        // Create the polyline and add the symbol via the 'icons' property.
        var line = new google.maps.Polyline({
          path: mapLocations,
          icons: [{
            icon: lineSymbol,
            offset: '100%'
          }],
          map: map
        });
      }

function displayLastLocations()
{
	turnOffMode(currentMode);
    turnOnMode("album");
	
	query = "SELECT id, path, description, album_id, rating, location_id, to_char(date_taken,'DD/MM/YYYY') date_taken FROM photos WHERE LOCATION_ID IS NOT NULL ORDER BY date_taken";
	console.log(query);
	conn.all(query, function(err, data) {
        currentPhotoList = data;
        currentPhotoIndex = 0;
        currentPhotoWindowFirstIndex = 0;
		
		console.log(currentPhotoList);
		
		mapLocations = [];
		currentPhotoList.forEach(function(item,i) 
		{
			console.log(item['LOCATION_ID']);
			getLocationCoords(item['LOCATION_ID'], function(err, val)
			{
				if (val[0] !== undefined) {
					mapLocations[i] = ({lng: val[0]['LONGITUDE'], lat: val[0]['LATITUDE']});
					if (mapLocations.length == currentPhotoList.length) {
						displayMap();
					}
				}
			});
		});
		displayCurrentPhotoWindow();
    });
}

function displayPhoto(index)
{
    turnOffMode(currentMode);
    turnOnMode("photo");
    photoIndex = index;
    updatePhotoDisplay();
}

function displaySmartStats()
{
	query = "select location_id, to_char(date_taken,'yyyy') year, count(*) cnt from photos where location_id is not null and date_taken is not null group by rollup(location_id,to_char(date_taken,'yyyy'))";
	turnOffMode(currentMode);
	turnOnMode("stats");
	
	
	
}


function displayMap()
{
	$("#map").css('display','block');
	$("#mapscript").html();
	$("#mapscript").html('<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBFqAIgqwl069fuJXaxGUXNLJx3vqdZZ2o&callback=initMap"></script>');
}


function updatePhotoDisplay()
{
	$("#map").hide();
    $("#photoCanvas").css('background','black url(\'' + currentPhotoList[photoIndex]['PATH'] + '\') no-repeat fixed center');
    $("#photoCanvas").css('background-size','contain    ');
    var shortTitle = currentPhotoList[photoIndex]['PATH'].substr(currentPhotoList[photoIndex]['PATH'].lastIndexOf("/")+1);
    $("#photoTitle").html(shortTitle);
    var description = currentPhotoList[photoIndex]['DESCRIPTION'];
    var rating = currentPhotoList[photoIndex]['RATING'];
	var dateTaken = currentPhotoList[photoIndex]['DATE_TAKEN'];

    if (description === null)
    {
        description = "<i>No description for this photo</i>";
        $("#photoDescEdit").val("");
    }
    else
    {
        $("#photoDescEdit").val(description);
    }
    $("#photoDesc").html(description);
	
	description = dateTaken;
	
	if (dateTaken === null)
    {
        description = "<i>Date taken unknown</i>";
        $("#photoDateEdit").val("");
    }
    else
    {
        $("#photoDateEdit").val(description);
    }
    $("#photoDate").html(description);

    for (var i = 1; i <= 5; i ++)
    {
        if (i == rating)
            $("#rate"+i).css('backgroundColor','yellow');
        else
            $("#rate"+i).css('backgroundColor','black');
    }

    getPeopleInPhoto(currentPhotoList[photoIndex]['ID'], function(err,rows)
    {
        if (rows.length > 0)
        {
            var conts = "";
            for (var i = 0 ; i < rows.length ; i++)
                conts += rows[i]['NAME'] + ", ";
            $("#peopleInThisPhoto").html(conts);
        }
        else
        {
            $("#peopleInThisPhoto").html('<i>No people tagged.</i>')
        }
        currentPhotoPeopleList = rows;
        updatePeopleInPhotoModal();
    });

    getAlbumName(currentPhotoList[photoIndex]['ALBUM_ID'], function(err, val)
    {
        $("#albumName").html(val[0]['TITLE']);
    });

    getLocationName(currentPhotoList[photoIndex]['LOCATION_ID'], function(err, val)
    {
        if (val[0] === undefined)
            $("#locationName").html('<i>No location set</i>');
        else
            $("#locationName").html(val[0]['NAME']);
    });

}

function hidePhoto()
{
    turnOffMode(currentMode);
    turnOnMode("album");
}

function nextPhoto()
{
    if (photoIndex < currentPhotoList.length - 1)
        photoIndex ++;
    if (photoIndex > currentPhotoWindowFirstIndex + photosPerPage) {
        currentPhotoWindowFirstIndex += photosPerPage + 1;
        displayCurrentPhotoWindow();
    }
    updatePhotoDisplay();
}

function previousPhoto()
{
    if (photoIndex > 0 )
        photoIndex --;
    if (photoIndex >= 0) {
            currentPhotoWindowFirstIndex -= photosPerPage + 1;
            if (currentPhotoWindowFirstIndex < 0)
                currentPhotoWindowFirstIndex = 0;
            displayCurrentPhotoWindow();
        }
    updatePhotoDisplay();
}

function nextPhotos()
{
    if (currentPhotoWindowFirstIndex < currentPhotoList.length - photosPerPage - 1)
        currentPhotoWindowFirstIndex += photosPerPage;
    displayCurrentPhotoWindow();
}

function prevPhotos()
{
        currentPhotoWindowFirstIndex -= photosPerPage;
        if (currentPhotoWindowFirstIndex < 0)
            currentPhotoWindowFirstIndex = 0;
    displayCurrentPhotoWindow();
}
