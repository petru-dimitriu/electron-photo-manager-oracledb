function prepareUI()
{
    $("#photoDesc").click( function()
        {
            $(this).hide();
            $("#photoDescEdit").show();
            $("#photoDescEdit").focus();
        }
    );

    $("#photoDescEdit").focusout( function()
    {
        $(this).hide();
        $("#photoDesc").show();
        if ($("#photoDescEdit").val() != "")
        {
            $("#photoDesc").html($("#photoDescEdit").val());
            updatePhotoDescription();
        }
    });

    $("#photoDescEdit").keypress(function(e)
    {
        if (e.which == 13)
            $(this).focusout();
    }
    );
	
		
	/////////////////

	
	$("#photoDate").click( function()
        {
            $(this).hide();
            $("#photoDateEdit").show();
            $("#photoDateEdit").focus();
        }
    );

    $("#photoDateEdit").focusout( function()
    {
        $(this).hide();
        $("#photoDate").show();
        if ($("#photoDateEdit").val() != "")
        {
            $("#photoDate").html($("#photoDate").val());
            updatePhotoDate();
        }
    });	

    $("#photoDateEdit").keypress(function(e)
    {
        if (e.which == 13)
            $(this).focusout();
    }
    );

    $("#closeModal").click(hideModal);
    $("#peopleInThisPhoto").click(displayPeopleInPhotoModal);
}

function getCurrentPhotoPeopleListAsSpans()
{
    var ret = "Currently tagged:<br> ";
    if (currentPhotoPeopleList.length == 0)
        ret += "nobody";
    for (var i = 0; i < currentPhotoPeopleList.length; i++)
    {
        ret += "<span class='removable' persid='" + currentPhotoPeopleList[i]['ID'] + "'> " + currentPhotoPeopleList[i]['NAME'] + "</span>";
    }
    return ret;
}

function updatePeopleInPhotoModal()
{
    $("#currentPeopleInPhoto").html(getCurrentPhotoPeopleListAsSpans());

    $(".removable").click( function() {
        removePersonFromPhoto(
            $(this).attr('persid'),
            currentPhotoList[photoIndex]['ID'],
            function(){
                updatePhotoDisplay();
                setTimeout(100,updatePeopleInPhotoModal);
            }
        );
    });

    $("#incrementalSearchDiv").html("<input id='incrementalSearchVal' style='width:100%;' placeholder = 'Type here to search.'>");
}

function preparePeopleInPhotoModal()
{
    $(".modal-body").html('<div id = "currentPeopleInPhoto"> </div> \
    <div id = "incrementalSearchDiv"> </div>\
    <div id = "allPeopleList"> </div>');
}

function displayPeopleInPhotoModal()
{
    displayModal();
    $("#modalTitle").html('People in this photo');
    preparePeopleInPhotoModal();
    updatePeopleInPhotoModal();
    getPeopleList(getPeopleListAsSpans);
}

function displayAlbumModal()
{
    displayModal();
    $("#modalTitle").html('Set album');
  getAlbums(function(err, rows)
    {
        var conts = "<select id='albumSelect' style='width:100%' onchange='javascript:changeAlbumClick()'>";
        for (var i = 0; i < rows.length ; i ++)
        {
            conts += "<option value ='" + rows[i]['ID'] + "' > " + rows[i]['TITLE'] + "</option>";
        }
        conts += "</select>";
        $(".modal-body").html(conts);
        $("#albumSelect").val(currentPhotoList[currentPhotoIndex]['album_id']);
    });
}

function displayLocationModal()
{
    displayModal();
    $("#modalTitle").html('Set location');
  getLocations(function(err, rows)
    {
        var conts = "<select id='locationSelect' style='width:100%' onchange='javascript:changeLocationClick()'>";
        for (var i = 0; i < rows.length ; i ++)
        {
            conts += "<option value ='" + rows[i]['ID'] + "' > " + rows[i]['NAME'] + "</option>";
        }
        conts += "</select>";
        $(".modal-body").html(conts);
        $("#albumSelect").val(currentPhotoList[currentPhotoIndex]['LOCATION_ID']);
    });
}

function changeAlbumClick()
{
    movePhotoToAlbum(currentPhotoList[currentPhotoIndex]['id'], $("#albumSelect").val(),
    function(err)
{
    var initialBgColour = $("#albumSelect").css('backgroundColor');
    if (err != null)
    {
        $("#albumSelect").css('backgroundColor','red');
    }
    else
    {
        currentPhotoList[currentPhotoIndex]['ALBUM_ID'] = $("#albumSelect").val();
        $("#albumSelect").css('backgroundColor','green');
        updatePhotoDisplay();
    }
    $("#albumSelect").animate({backgroundColor:initialBgColour},500);
})
}

function changeLocationClick()
{
    movePhotoToLocation(currentPhotoList[photoIndex]['ID'], $("#locationSelect").val(),
    function(err)
{
    var initialBgColour = $("#locationSelect").css('backgroundColor');
    if (err != null)
    {
        $("#locationSelect").css('backgroundColor','red');
    }
    else
    {
        $("#locationSelect").css('backgroundColor','green');
        currentPhotoList[photoIndex]['LOCATION_ID'] = $("#locationSelect").val();
        updatePhotoDisplay();
    }
    $("#locationSelect").animate({backgroundColor:initialBgColour},500);
})
}

function peopleModalInputKeydown(event)
{
        incrementalSearchPeopleModal();
}

function getPeopleListAsSpans(rows)
{
    var conts = "All people:<br>";
    for (var i = 0; i < rows.length ; i++)
    {
        conts += "<span class='searchable' persid='" + rows[i]['ID'] + "'>" + rows[i]['NAME'] + "</span> ";
    }
    $("#allPeopleList").html(conts);
    $("#incrementalSearchVal").keydown(peopleModalInputKeydown);
    $(".searchable").click(function() {
        insertPersonInPhoto(
            $(this).attr('persid'),
            currentPhotoList[photoIndex]['ID'],
            function(){
                updatePhotoDisplay();
                setTimeout(100,updatePeopleInPhotoModal);
            }
        );
    });
}

function incrementalSearchPeopleModal()
{
    var searchval = $("#incrementalSearchVal").val();
    var tableRows = $(".searchable");
    for (var i=0;i<=tableRows.length;i++)
    {
        if ($(tableRows[i]).text().search(searchval) == -1)
            $(tableRows[i]).css("display","none");
        else
        {
            $(tableRows[i]).css("display","inline");
        }
    }
}

function displayModal()
{
    $("#myModal").css('display','block');
}

function hideModal()
{
    $("#myModal").css('display','none');
}

function notify(text)
{
    $("#bottombar").html(text);
}

function setTitle(text)
{
    $("#title").html(text);
}

function turnOffMode(mode)
{
    if (mode == 'album' || mode == 'stats')
    {
        $("#mainViewer").hide();
        $("#commands").hide();
    }
    else if (mode == 'photo' )
    {
        $("#photoViewer").hide();
        $("#photoViewer").css('opacity',0);
        $("#photoViewer").css('z-index',-1);
        $("#photoCanvas").css('opacity',0);
        $(window).off("keydown");
    }
    else if (mode == 'people' || mode == 'search' || mode == 'Location')
    {
        $("#conts").html('');
    }
}

function turnOnMode(mode)
{
	$("#map").css('display','none');
	$("#mapscript").html('');
	
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
    else if (mode == 'people')
    {
        $("#mainViewer").show();
        $("#commands").show();
        $("#conts").show();
        setTitle("People");
    }
	else if (mode == 'stats')
    {
        $("#mainViewer").show();
        $("#commands").show();
        $("#conts").show();
        setTitle("Yearly location stats");
    }
    else if (mode == 'Location')
    {
        $("#mainViewer").show();
        $("#commands").show();
        $("#conts").show();
        setTitle("Locations");
    }
    else if (mode == 'search')
    {
        $("#mainViewer").show();
        $("#commands").show();
        $("#conts").show();
        loadSearch();
        setTitle("Search");
    }
}

function changeMode(newMode)
{
    turnOffMode(currentMode);
    turnOnMode(newMode);
}
