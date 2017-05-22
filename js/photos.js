
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

		var shortTitle = currentPhotoList[i]['path'].substr(currentPhotoList[i]['path'].lastIndexOf("/")+1);

		contents +=
		  "<td style='background-image: url(\""  + currentPhotoList[i]['path'] + "\")' onclick='javascript:displayPhoto(" + i + ")'>" +
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
		query = "SELECT * FROM photos WHERE album_id = " + albumId;
	contents = "<table>";
	db.all(query, function(err, data) {
		currentPhotoList = data;
		currentPhotoIndex = 0;
		currentPhotoWindowFirstIndex = 0;
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


function updatePhotoDisplay()
{
	$("#photoCanvas").css('background','black url(\'' + currentPhotoList[photoIndex]['path'] + '\') no-repeat fixed center');
	$("#photoCanvas").css('background-size','contain	');
	var shortTitle = currentPhotoList[photoIndex]['path'].substr(currentPhotoList[photoIndex]['path'].lastIndexOf("/")+1);
	$("#photoTitle").html(shortTitle);
	var description = currentPhotoList[photoIndex]['description'];
	var rating = currentPhotoList[photoIndex]['rating'];

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

	for (var i = 1; i <= 5; i ++)
	{
		if (i == rating)
			$("#rate"+i).css('backgroundColor','yellow');
		else
			$("#rate"+i).css('backgroundColor','black');
	}

	getPeopleInPhoto(currentPhotoList[photoIndex]['id'], function(err,rows)
	{
		if (rows.length > 0)
		{
			var conts = "";
			for (var i = 0 ; i < rows.length ; i++)
				conts += rows[i]['name'] + ", ";
			$("#peopleInThisPhoto").html(conts);
		}
		else
		{
			$("#peopleInThisPhoto").html('<i>No people tagged in this photo. Click to add.</i>')
		}
		currentPhotoPeopleList = rows;
		updatePeopleInPhotoModal();
	});

	getAlbumName(currentPhotoList[photoIndex]['album_id'], function(err, val)
	{
		$("#albumName").html(val[0]['title']);
	});

	getLocationName(currentPhotoList[photoIndex]['location_id'], function(err, val)
	{
		$("#locationName").html(val[0]['name']);
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
