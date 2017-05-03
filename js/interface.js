function prepareUI()
{
	$("#photoDesc").click( function()
		{
			$(this).hide();
			$("#photoDescEdit").val($("#photoDesc").html());
			$("#photoDescEdit").show().focus();
		}
	);

	$("#photoDescEdit").focusout( function()
	{
		$(this).hide();
		$("#photoDesc").show();
		$("#photoDesc").html($("#photoDescEdit").val());

		updatePhotoDescription();
	});

	$("#photoDescEdit").keypress(function(e)
	{
		if (e.which == 13)
			$(this).focusout();
	}
);
}

function notify(text)
{
	$("#bottombar").html(text);
}

function setTitle(text)
{
	$("#title").html(text);
}


function displayCurrentPhotoWindow()
{
	var numPhotos = -1;
	contents = "";
	for (var i = currentPhotoWindowFirstIndex; i < currentPhotoWindowFirstIndex + photosPerPage  && i < currentPhotoList.length; i++) {
		if (currentPhotoList[i] == null)
			continue;
		numPhotos++;
		if ((numPhotos % 5) === 0) {
			contents += "<tr>";
		}

		var shortTitle = currentPhotoList[i]['path'].substr(currentPhotoList[i]['path'].lastIndexOf("/")+1);

		contents += "<td>" +
			"<a href='javascript:displayPhoto(" + i + ")'>" +
			"<img src='" + currentPhotoList[i]['path'] + "' style='width:19vw; max-height:30vh'></img>" +
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


function displayPhotos(albumId, albumTitle)
{
	currentMode = "album";
	$('#title').html(albumTitle);
	$('#albumViewerCommands').css('display','block');
	var query = "SELECT * FROM photos WHERE album = " + albumId;
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

function turnOffMode(mode)
{
	if (mode == 'album')
	{
		$("#mainViewer").hide();
		$("#commands").hide();
	}
	else if (mode == 'photo')
	{
		$("#photoViewer").hide();
		$("#photoViewer").css('opacity',0);
		$("#photoViewer").css('z-index',-1);
		$("#photoCanvas").css('opacity',0);
		$(window).off("keydown");
	}
}

function turnOnMode(mode)
{
	currentMode = mode;
	if (mode == 'album')
	{
		$("#mainViewer").show();
		$("#commands").show();
	}
	else if (mode == 'photo')
	{
		$("#photoViewer").show();
		$("#photoViewer").css('opacity',1);
		$("#photoViewer").css('z-index',30);
		$("#photoCanvas").css('opacity',1);
		$(window).keydown(function (e)
			{
				if ((e.keyCode || e.which) == 37) // left
					previousPhoto();
				else if ((e.keyCode || e.which) == 39) // right
					nextPhoto();
			});
	}
}

function updatePhotoDisplay()
{
	$("#photoCanvas").css('background','black url(\'' + currentPhotoList[photoIndex]['path'] + '\') no-repeat fixed center');
	$("#photoCanvas").css('background-size','contain	');
	var shortTitle = currentPhotoList[photoIndex]['path'].substr(currentPhotoList[photoIndex]['path'].lastIndexOf("/")+1);
	$("#photoTitle").html(shortTitle);
	var description = currentPhotoList[photoIndex]['description'];
	var rating = currentPhotoList[photoIndex]['rating'];
	console.log(currentPhotoList[photoIndex]);
	if (description === null)
		description = "<i>No description for this photo</i>";
	$("#photoDesc").html(description);
	for (var i = 1; i <= 5; i ++)
	{
		if (i == rating)
			$("#rate"+i).css('backgroundColor','yellow');
		else
			$("#rate"+i).css('backgroundColor','black');
	}
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
