
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
        query = "SELECT * FROM photos WHERE album_id = " + albumId;
    contents = "<table>";
    conn.all(query, function(err, data) {
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
    $("#photoCanvas").css('background','black url(\'' + currentPhotoList[photoIndex]['PATH'] + '\') no-repeat fixed center');
    $("#photoCanvas").css('background-size','contain    ');
    var shortTitle = currentPhotoList[photoIndex]['PATH'].substr(currentPhotoList[photoIndex]['PATH'].lastIndexOf("/")+1);
    $("#photoTitle").html(shortTitle);
    var description = currentPhotoList[photoIndex]['DESCRIPTION'];
    var rating = currentPhotoList[photoIndex]['RATING'];

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
