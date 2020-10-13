var environment = "DEV"; // PROD/TEST/DEV

var resourcesRoot = "https://mopeddev.z5.web.core.windows.net/"; // Default is PROD. 

if (environment == "TEST") { resourcesRoot = "https://mopeddev.z5.web.core.windows.net/"; }
else if (environment == "DEV_old") { resourcesRoot = "https://fullcalendardemo.blob.core.windows.net/filecalendarnew/"; }
// SB Added 5_11_2020 to point to the new SBUX environment. "Dev" as above will be decommisioned at a later date.
else if (environment == "DEV") { resourcesRoot = "https://mopeddev.z5.web.core.windows.net/"; }
else if (environment == "UAT") { resourcesRoot = "https://mopeddev.z5.web.core.windows.net/"; }

var resourcesDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnResources']";
var placementsDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnPlacements']";
var startdateDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnStartDate']";
var callFunctionDataLabelPath = "Controllers/Controller/Controls/Control[@Name='jsCallFunction']";
var placementIDDataLabelPath = "Controllers/Controller/Controls/Control[@Name='txtPlacementID']";
var placementJSONDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnPlacementJSON']";
var hdnSelectedJSONDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnSelectedJSON']";
var messageBodyDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnMessageBody']";
var messageTitleDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnMessageTitle']";
var fiscalYearStartDateDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnFiscalYearStartDate']";
var weekCountDateDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnWeekCount']";
var maxWidthDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnMaxWidth']";
var maxHeightDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnMaxHeight']";
var limitHeightDataLabelPath = "Controllers/Controller/Controls/Control[@Name='hdnLimitHeight']";

var anchorName = "anchor";

var calendarView;
var calResources = [];
var calPlacements = [];
var fiscalYearStartDate;
var calStartDate;
var firstDayNumber;
var weekCount;
var calMaxWidth;
var calMaxHeight;
var calLimitHeight;

function LoadCalenderResources() {
    // Load CSS files
    $('head').append('<link rel="stylesheet" href=\"' + resourcesRoot + 'core.main.min.css\"/>');
    $('head').append('<link rel="stylesheet" href=\"' + resourcesRoot + 'timeline.main.min.css\"/>');
    $('head').append('<link rel="stylesheet" href=\"' + resourcesRoot + 'resource-timeline.main.min.css\"/>');

    // Load JS scripting libraries
    $.getScript(resourcesRoot + "core.main.min.js", function () {
        $.getScript(resourcesRoot + "timeline.main.min.js", function () {
            $.getScript(resourcesRoot + "resource-common.main.min.js", function () {
                $.getScript(resourcesRoot + "resource-timeline.main.min.js", function () {
                    $.getScript(resourcesRoot + "interaction.main.min.js", function () {
                        $.getScript(resourcesRoot + "popper.min.js", function () {
                            $.getScript(resourcesRoot + "tooltip.min.js", RenderCalendarView);
                        });
                    });
                });
            });
        });
    });
}

function RenderCalendarView() {
    LoadCalendarConfig();
    LoadResources();
    LoadPlacements();

    if ((calResources.lenth == 0) && (calPlacements.length == 0)) {
        return;
    }

    $anchor = $("span[name='" + anchorName + "']");
    $anchor.parent().append('<div id="calendarAnchor" style="max-width: ' + calMaxWidth + '; margin: 0 auto; font-family: Lucida Grande,Helvetica,Arial,Verdana,sans-serif;font-size: 14px;"></div>');
    var calendarDiv = document.getElementById('calendarAnchor');

    calendarView = new FullCalendar.Calendar(calendarDiv, {
        schedulerLicenseKey: '0551063718-fcs-1569890599',
        plugins: ['interaction', 'resourceTimeline'],
        header: {
            left: 'prev,next',
            center: 'title',
            right: ''
        },
        now: calStartDate,
        editable: false, // enable draggable events
        aspectRatio: 2.25,
        defaultView: 'resourceTimelineFiscalWeek',
        views: {
            resourceTimelineFiscalWeek: {
                type: 'resourceTimelineDay',
                duration: { weeks: weekCount },
                weekends: true,
            }
        },
        slotWidth: '80',
        slotLabelFormat:
            [{ month: 'long', year: 'numeric' },
            { week: 'short' },
            { weekday: 'short', month: '2-digit', day: '2-digit', omitCommas: 'true' }
            ],
        selectable: true,
        //select: HandleCalendarSelect,
        resourceAreaWidth: '25%',
        resourceGroupField: 'channelName',
        resourceColumns: [
            {
                labelText: 'Sub Channel',
                field: 'subChannelName',
                render: function (resource, el) {
                    el.style.wordWrap = 'normal';
                    el.style.wordBreak = 'normal';
                    el.style.whiteSpace = 'normal';
                }
            },
            {
                labelText: 'Placement',
                field: 'channelPlacementName',
                render: function (resource, el) {
                    el.style.wordWrap = 'normal';
                    el.style.wordBreak = 'normal';
                    el.style.whiteSpace = 'normal';
                }
            }
        ],
        resources: calResources,
        events: calPlacements,
        eventRender: HandlePlacementRender,
        eventClick: HandlePlacementClick,
        //eventDrop: HandlePlacementDrop,
        //eventResize: HandlePlacementResize
        firstDay: firstDayNumber,
        weekNumberCalculation: LoadFiscalWeek,
        weekLabel: "Fiscal Week",
        weekNumbers: true
    });

    calendarView.setOption("height", "auto");
    calendarView.render();

    if ((calendarView.el.clientHeight > calMaxHeight) && (calLimitHeight == "TRUE")) {
        calendarView.setOption("height", calMaxHeight);
    }

    window.onresize = HandleWindowResize;
    HandleWindowResize();
}

function LoadCalendarConfig() {
    var fiscalYearStartDateDataLabel = window.$sn(window.viewControllerDefinition, fiscalYearStartDateDataLabelPath);
    var startDateDataLabel = window.$sn(window.viewControllerDefinition, startdateDataLabelPath);
    var weekCountDateDataLabel = window.$sn(window.viewControllerDefinition, weekCountDateDataLabelPath);
    var maxWidthDataLabel = window.$sn(window.viewControllerDefinition, maxWidthDataLabelPath);
    var maxHeightDataLabel = window.$sn(window.viewControllerDefinition, maxHeightDataLabelPath);
    var limitHeightDataLabel = window.$sn(window.viewControllerDefinition, limitHeightDataLabelPath);

    if ($("#" + fiscalYearStartDateDataLabel.getAttribute("ID")).text().length > 0) {
        fiscalYearStartDate = new Date($("#" + fiscalYearStartDateDataLabel.getAttribute("ID")).text());
    }

    if ($("#" + startDateDataLabel.getAttribute("ID")).text().length > 0) {
        calStartDate = new Date($("#" + startDateDataLabel.getAttribute("ID")).text());
        firstDayNumber = calStartDate.getDay();
    }

    if ($("#" + weekCountDateDataLabel.getAttribute("ID")).text().length > 0) {
        weekCount = parseInt($("#" + weekCountDateDataLabel.getAttribute("ID")).text());
    }

    calMaxWidth = $("#" + maxWidthDataLabel.getAttribute("ID")).text();

    if ($("#" + maxHeightDataLabel.getAttribute("ID")).length > 0) {
        calMaxHeight = parseInt($("#" + maxHeightDataLabel.getAttribute("ID")).text());
    }

    if ($("#" + limitHeightDataLabel.getAttribute("ID")).length > 0) {
        calLimitHeight = $("#" + limitHeightDataLabel.getAttribute("ID")).text().trim().toUpperCase();
    }
}

function LoadFiscalWeek(date) {
    var offsetDate = new Date(date.toDateString());
    var diff = Math.ceil((offsetDate - fiscalYearStartDate) / (24 * 3600 * 1000)) / 7;
    var yearCount = Math.abs(Math.trunc(diff / 52));

    if (Math.abs(diff) % 1.0 == 0) {
        if (diff >= 0) {
            diff = diff + 0.1;
        }
        else {
            diff = diff - 0.1;
        }
    }

    if (diff > 0) {
        diff = Math.ceil(diff);
        diff = (diff - (53 * yearCount)) + yearCount;
    }
    else {
        diff = Math.floor(diff);
        diff = (diff + (53 * (yearCount + 1))) - yearCount;
    }

    return diff;
}

function LoadResources() {
    var resourcesDataLabel = window.$sn(window.viewControllerDefinition, resourcesDataLabelPath);
    var jsonResources = $("#" + resourcesDataLabel.getAttribute("ID")).html();

    if (jsonResources.length > 0) {
        var resourcesArray = $.parseJSON(jsonResources);
        calResources = [];

        $.each(resourcesArray, function (index, value) {
            calResources.push({
                id: value["ResourceID"],
                title: value["Title"],
                channelName: value["ChannelName"],
                channelSortOrder: value["ChannelSortOrder"],
                subChannelID: value["SubChannelID"],
                subChannelName: value["SubChannelName"],
                subChannelSortOrder: value["SubChannelSortOrder"],
                channelPlacementID: value["ChannelPlacementID"],
                channelPlacementName: value["ChannelPlacementName"]
            });
        });
    }
}

function LoadPlacements() {
    var placementsDataLabel = window.$sn(window.viewControllerDefinition, placementsDataLabelPath);
    var jsonPlacements = $("#" + placementsDataLabel.getAttribute("ID")).html();

    if (jsonPlacements.length > 0) {
        var placementsArray = $.parseJSON(jsonPlacements);
        calPlacements = [];

        $.each(placementsArray, function (index, value) {
            calPlacements.push({
                id: value["PlacementID"],
                resourceId: value["ResourceID"],
                start: value["StartDate"],
                end: value["EndDate"],
                title: value["Title"].replace("&amp;", "&"),
                color: value["backgroundColor"],
                textColor: value["textColor"],
                //Added by Steve to enable the configuration of the font size, weight and size
                    fontFamily: value["fontFamily"],
                    fontSize: value["fontSize"],
                    fontWeight: value["fontWeight"],
                //end added by steve
                keyMessage: value["KeyMessage"],
                campaignID: value["CampaignID"],
                campaignName: value["CampaignName"].replace("&amp;", "&"),
                allDay: value["allDay"],
                trueStartDate: value["TrueStartDate"],
                trueEndDate: value["TrueEndDate"],
                deployTakeDownDate: value["DeployTakeDownDate"],
                channelMappingID: value["ChannelMappingID"],
                deployDate: value["DeployDate"],
                sprintType: value["SprintType"]
            });
        });
    }
}

function RefreshPlacements() {
    LoadPlacements();

    calendarView.removeAllEvents();
    calendarView.addEventSource(calPlacements);

    var callFunctionDataLabel = window.$sn(window.viewControllerDefinition, callFunctionDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, "", callFunctionDataLabel.getAttribute("ID"));
    window.executeControlFunction(callFunctionDataLabel, "SetValue", controlInfoObj);
}

function HandleCalendarSelect(info) {
    //https://fullcalendar.io/docs/select-callback

    var selectedJSON = '[{"ResourceID":"' + info.resource.id + '", "StartDate":"' + info.start.toISOString() + '", "EndDate":"' + info.end.toISOString() + '"}]';
    var hdnSelectedJSONDataLabel = window.$sn(window.viewControllerDefinition, hdnSelectedJSONDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, selectedJSON, hdnSelectedJSONDataLabel.getAttribute("ID"));
    window.executeControlFunction(hdnSelectedJSONDataLabel, "SetValue", controlInfoObj);
}

function HandlePlacementRender(info) {
    // https://fullcalendar.io/docs/eventRender



    info.el.style.borderRadius = "5px";

    var spanElement = $(info.el).find("span");
    spanElement.css("color", info.event.textColor);
    spanElement.css("font-family", "Arial");
    spanElement.css("font-size", "10pt");
    spanElement.css("font-weight", "bold");

    //Steve testing to see if we can set the font size, weight and family from the SPROC
    ////spanElement.css("font-size", info.event.fontSize);
    ////alert(info.event.fontSize);

    ////Added by Steve to enable the configuration of the font family
    //if (info.event.fontfamily = "")
    //    spanElement.css("font-family", "Arial");
    //else
    //    spanElement.css("font-family", info.event.fontfamily);

    ////Added by Steve to enable the configuration of the font size
    //if (info.event.fontSize = "")
    //    spanElement.css("font-size", "10pt");
       
    //else
    //    spanElement.css("font-size", info.event.fontSize);

    ////Added by Steve to enable the configuration of the font weight
    //if (info.event.fontWeight = "")
    //    spanElement.css("font-weight", "bold");
    //else
    //    spanElement.css("font-weight", info.event.fontWeight);
   
   
    spanElement.css("padding-left", "20px");

    // https://popper.js.org/tooltip-examples.html
    // https://github.com/FezVrasta/popper.js

    var keyMessage = info.event.extendedProps.keyMessage == undefined ? "" : info.event.extendedProps.keyMessage
    var deployTakeDownDate = info.event.extendedProps.deployTakeDownDate == undefined ? "" : info.event.extendedProps.deployTakeDownDate

    // Monthly Spots
    var monthlySpotsChannels = [58, 53, 54, 55, 56];
    var isMonthlySpots = monthlySpotsChannels.includes(info.event.extendedProps.channelMappingID);

    var monthlySpotsTooltipText = "<strong>" + info.event.extendedProps.campaignName + "</strong><br/>" +
        "<strong>" + keyMessage + "</strong><br/>" +
        "Deploy Date: " + info.event.extendedProps.deployDate + "<br/>" +
        "Take Down Date: " + deployTakeDownDate + "<br/>" +
        "Offer Start Date: " + info.event.extendedProps.trueStartDate + "<br/>" +
        "Offer End Date: " + info.event.extendedProps.trueEndDate;

    // Monthly Email/Push
    var emailChannels = [60, 62, 57];
    var isEmailOrPush = emailChannels.includes(info.event.extendedProps.channelMappingID);

    var emailOrPushTooltipText = "<strong>" + info.event.extendedProps.campaignName + "</strong><br/>" +
        "<strong>" + keyMessage + "</strong><br/>" +
        "Deploy Date: " + info.event.extendedProps.deployDate + "<br/>" +
        "Offer Start Date: " + info.event.extendedProps.trueStartDate + "<br/>" +
        "Offer End Date: " + info.event.extendedProps.trueEndDate;

    // Seasonal Spots
    var seasonalSpotsChannels = [58, 67, 68, 69, 70, 71, 72, 53, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92];
    var isSeasonalSpots = seasonalSpotsChannels.includes(info.event.extendedProps.channelMappingID);

    var seasonalSpotsTooltipText = "<strong>" + info.event.extendedProps.campaignName + "</strong><br/>" +
        "<strong>" + keyMessage + "</strong><br/>" +
        "Live Start Date: " + info.event.extendedProps.trueStartDate + "<br/>" +
        "Live End Date: " + info.event.extendedProps.trueEndDate;

    // Seasonal Newsletter
    var seasonalNewsletterChannels = [60, 62];
    var isSeasonalNewsletter = seasonalNewsletterChannels.includes(info.event.extendedProps.channelMappingID);

    var seasonalNewsletterTooltipText = "<strong>" + info.event.extendedProps.campaignName + "</strong><br/>" +
        "<strong>" + keyMessage + "</strong><br/>" +
        "Deploy Date: " + info.event.extendedProps.deployDate;

    // Default
    var tooltipText = "<strong>" + info.event.extendedProps.campaignName + "</strong><br/>" +
        "<strong>" + keyMessage + "</strong><br/>" +
        "Start: " + info.event.extendedProps.trueStartDate + "<br/>" +
        "End: " + info.event.extendedProps.trueEndDate;

    if (info.event.extendedProps.sprintType == 'Monthly') {
        if (isMonthlySpots)
            tooltipText = monthlySpotsTooltipText;
        else if (isEmailOrPush)
            tooltipText = emailOrPushTooltipText;
    }
    else if (info.event.extendedProps.sprintType == 'Seasonal') {
        if (isSeasonalSpots)
            tooltipText = seasonalSpotsTooltipText;
        else if (isSeasonalNewsletter)
            tooltipText = seasonalNewsletterTooltipText;
    }

    var placementTooltip = new Tooltip(info.el, {
        title: tooltipText,
        html: true,
        delay: { show: 100, hide: 100 },
        placement: 'top',
        trigger: 'hover',
        container: 'body'
    });
}

function HandlePlacementClick(info) {
    // https://fullcalendar.io/docs/eventClick
    var placementIDDataLabel = window.$sn(window.viewControllerDefinition, placementIDDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, info.event.id, placementIDDataLabel.getAttribute("ID"));
    window.executeControlFunction(placementIDDataLabel, "SetValue", controlInfoObj);
    //window.raiseEvent(placementIDDataLabel.getAttribute("ID"), "Control", "OnChange");
}

function HandlePlacementDrop(info) {
    // https://fullcalendar.io/docs/eventDrop

    var placementJSON = '[{"PlacementID":"' + info.event.id + '","ResourceID":"' + info.newResource.id + '","StartDate":"' + info.event.start.toISOString() + '","EndDate":"' + info.event.end.toISOString() + '","Title":"' + info.event.title + '","backgroundColor":"' + info.event.backgroundColor + '","KeyMessage":"' + info.event.extendedProps['keyMessage'] + '","CampaignID":"' + info.event.extendedProps['campaignID'] + '"}]';
    var placementJSONDataLabel = window.$sn(window.viewControllerDefinition, placementJSONDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, placementJSON, placementJSONDataLabel.getAttribute("ID"));
    window.executeControlFunction(placementJSONDataLabel, "SetValue", controlInfoObj);

    var msgTitle = "PLACEMENT MOVED";
    var msgBody = "Placement <strong>" + info.event.title + "</strong> was moved from <strong>" + info.oldResource.title + "</strong> (" + info.oldResource.id + ") to <strong>" + info.newResource.title + "</strong> (" + info.newResource.id + ")";
    ShowMessage(msgTitle, msgBody);

    $(".tooltip").css("display", "block");
}

function HandlePlacementResize(info) {
    // https://fullcalendar.io/docs/eventResize

    var placementJSON = '[{"PlacementID":"' + info.event.id + '","ResourceID":"C000SC000","StartDate":"' + info.event.start.toISOString() + '","EndDate":"' + info.event.end.toISOString() + '","Title":"' + info.event.title + '","backgroundColor":"' + info.event.backgroundColor + '","KeyMessage":"' + info.event.extendedProps['keyMessage'] + '","CampaignID":"' + info.event.extendedProps['campaignID'] + '"}]';
    var placementJSONDataLabel = window.$sn(window.viewControllerDefinition, placementJSONDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, placementJSON, placementJSONDataLabel.getAttribute("ID"));
    window.executeControlFunction(placementJSONDataLabel, "SetValue", controlInfoObj);

    var msgTitle = "PLACEMENT RESIZED";
    var msgBody = "Placement <strong>" + info.event.title + "</strong> was resized to: <strong>" + info.event.start.toLocaleDateString() + ' - ' + info.event.end.toLocaleDateString() + "</strong>";
    ShowMessage(msgTitle, msgBody);
}

function HandlePlacementDragStart(info) {
    // https://fullcalendar.io/docs/eventDragStart

    $(".tooltip").css("display", "none");
}

function ShowMessage(title, body) {
    var messageBodyDataLabel = window.$sn(window.viewControllerDefinition, messageBodyDataLabelPath);
    var controlInfoObj = new window.PopulateObject(null, body, messageBodyDataLabel.getAttribute("ID"));
    window.executeControlFunction(messageBodyDataLabel, "SetValue", controlInfoObj);

    var messageTitleDataLabel = window.$sn(window.viewControllerDefinition, messageTitleDataLabelPath);
    controlInfoObj = new window.PopulateObject(null, title, messageTitleDataLabel.getAttribute("ID"));
    window.executeControlFunction(messageTitleDataLabel, "SetValue", controlInfoObj);
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function HandleWindowResize() {
    var formWidth = parseInt($("div.runtime-content").css("width").replace("px", ""));
    var calendarWidth = parseInt($("#calendarAnchor").css("width").replace("px", ""));
    var spacerWidth = (formWidth - calendarWidth - 18) / 2;

    $("span[name='lblLeftSpacer']").css("width", spacerWidth.toString() + "px");
    $("span[name='lblRightSpacer']").css("width", spacerWidth.toString() + "px");
}
