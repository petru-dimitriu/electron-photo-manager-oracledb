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

	$("#closeModal").click(hideModal);
	$("#peopleInThisPhoto").click(displayPeopleInPhotoModal);
}

function getCurrentPhotoPeopleListAsSpans()
{
	var ret = "";
	for (var i = 0; i < currentPhotoPeopleList.length; i++)
	{
		ret += "<span> " + currentPhotoPeopleList[i]['name'] + "</span>";
	}
	return ret;
}

function updatePeopleInPhotoModal()
{
	$("#modalTitle").html('People in this photo');
	$("#currentPeopleInPhoto").html(getCurrentPhotoPeopleListAsSpans());
	$("#incrementalSearchDiv").html("<input id='incrementalSearchVal' style='width:100%;' placeholder = 'Type here to search or insert new person.'>");
}

function displayPeopleInPhotoModal()
{
	displayModal();
	updatePeopleInPhotoModal();
	getPeopleList(getPeopleListAsSpans);
}

function peopleModalInputKeydown(event)
{
		incrementalSearchPeopleModal();
}

function getPeopleListAsSpans(rows)
{
	var conts = "";
	for (var i = 0; i < rows.length ; i++)
	{
		conts += "<span class='searchable' persid='" + rows[i]['id'] + "'>" + rows[i]['name'] + "</span> ";
	}
	$("#allPeopleList").html(conts);
	$("#incrementalSearchVal").keydown(peopleModalInputKeydown);
	$(".searchable").click(function() {
		insertPersonInPhoto(
			$(this).attr('persid'),
			currentPhotoList[photoIndex]['id'],
			function(){updatePhotoDisplay();
			updatePeopleInPhotoModal();
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
	else if (mode == 'people')
	{
		$("#conts").html('');
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
	else if (mode == 'people')
	{
		$("#conts").show();
		setTitle("People");
	}
}

function changeMode(newMode)
{
	turnOffMode(currentMode);
	turnOnMode(newMode);
}
