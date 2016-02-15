function Inits_Main(){
	dbug=[];
	Json={};
	VersionId="v5";
	//document.title="Find Your Fracker";
	AssetsPath="prjx270/";
	PhpPath="prjx270.php";
	GetMouseInit();
	Inits_Scripts();
}

function Inits_Scripts(){
	ScriptPaths=[
		AssetsPath+"jquery.js",
		AssetsPath+"jquery-ui.js",
		"https://www.google.com/jsapi",
		"http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js",
		"http://maps.stamen.com/js/tile.stamen.js"
	];
	ScriptsLoaded=0;
	for(Creep=0;Creep<ScriptPaths.length;Creep++){
		ActiveScriptPath=ScriptPaths[Creep];
		ActiveScript=document.head.appendChild(document.createElement("script"));
		ActiveScript.src=ScriptPaths[Creep];
		ActiveScript.onload=function(){
			ScriptsLoaded++;
			if(ScriptsLoaded==ScriptPaths.length){
				//Inits_Zindex();
				Inits_ToolTip();
				if(location.href!="http://www.findyourfracker.org/search/"){
					Inits_Banner();
					Inits_MainContent();
				}
				Inits_SiteSettings();
			}
		}
	}
}

function Inits_Banner(){
	Banner=$("#banner")[0];
	$.ajax({
		url:"images/banner.html?"+VersionId,
		type:"get",
		dataType:"text",
		error:function(a,b,c){
			console.log(a,b,c);
		},
		success:function(data){
			Banner.innerHTML=data;
			Banner.Count=$(Banner).find("div").length;
			Banner.Fnc=function(){
				$(Banner).find(".banner").css({opacity:0,display:"none"});
				Banner.Active=Math.ceil(Math.random()*Banner.Count);
				$("#Banner"+Banner.Active).css({display:"inline"}).animate({opacity:1});
			};
			Banner.Fnc();
			Banner.Intvl=setInterval(function(){Banner.Fnc()},5000);
		}
	});
}

function Inits_MainContent(){
	var Creep,ThisAnchor;
	Anchors=$(".maincontent");
	for(Creep=0;Creep<Anchors.length;Creep++){
		ThisAnchor=Anchors[Creep];
		ThisAnchor.href="javascript:Update_MainContent('"+ThisAnchor.id+"')";
		ThisAnchor.html="";
	}
}

function Update_MainContent(Specs){
	var ThisAnchor;
	ThisAnchor=$("#"+Specs)[0];
	if(Specs=="Map"){
		$(MainContentContainer).css({display:"none",opacity:0});
		$(ActiveMapDiv).css({display:"block"});
		//$(MapTypeDiv).css({display:"inline"});
		$(AreaSelect).css({display:"inline"});
		$([ActiveMapDiv,AreaSelect]).animate({opacity:1});//MapTypeDiv
	}else{
		if(ThisAnchor.html!=""){
			$([ActiveMapDiv,AreaSelect]).css({display:"none",opacity:0});//MapTypeDiv
			$(MainContentContainer).css({display:"block",opacity:0}).html(ThisAnchor.html).animate({opacity:1});
		}else{
			$.ajax({
				url:"images/"+Specs+".html?"+VersionId,
				type:"get",
				dataType:"text",
				context:{Anchor:ThisAnchor},
				error:function(a,b,c){
					console.log(a,b,c);
				},
				success:function(data){
					this.Anchor.html=data;
					$(".frontpage").css({backgroundImage:"none",backgroundColor:"#fff"});
					$([ActiveMapDiv,AreaSelect]).css({display:"none",opacity:0});//MapTypeDiv
					$(MainContentContainer).css({display:"block",opacity:0}).html(this.Anchor.html).animate({opacity:1});
				}
			});
		}
	}
}

function Inits_Zindex(){
	var AllObjects,Creep;
	AllObjects=$(document.body).find("*");
	for(Creep=0;Creep<AllObjects.length;Creep++){
		$(AllObjects[Creep]).css({zIndex:100+Creep});
	}
	$(".main").css({zIndex:0});
}

function Inits_SiteSettings(){
	$.ajax({
		url:AssetsPath+"SiteSettings.json?"+SessionId,
		type:"get",
		dataType:"json",
		error:function(a,b,c){
			//alert("data err: SiteSettings");
			console.log("data err",a,b,c);
		},
		success:function(data){
			Json.SiteSettings=data;
			Inits_Maps();
		}
	});
}

function Inits_Maps(){
	google.load("maps", "3.12", {"callback":function(){
		Inits_Stage();
	},"other_params":"sensor=true"});
}

function Inits_Stage(){
	if(location.href.indexOf("http://www.findyourfracker.org")==0){
		Inits_Splash();
	}
	$(document.body).css({padding:0,margin:0,borderWidth:0});
	Inits_StageTop();
	Inits_StageBottom();
	Inits_StageMiddle();
	Inits_StageExtras();
	Inits_ActiveMap();
	Inits_ActiveState();
}

function Inits_StageTop(){
	AddressInput=$("#address")
		.prop({value:AddressFromForm,PriorValue:""})
		.bind({
			focus:function(){
				setTimeout(function(){
					AddressInput.select();
				},100);
			},
			change:function(){
				SearchAddress();
			}
		})
		[0];
	AddressSubmit=$("#address-submit")
		.bind({
			click:function(){
				SearchAddress();
			}
		})
		[0];
}

function Inits_SearchAutoCompletes(){
	$(AddressInput).autocomplete({
		source:GetSearchAutoCompletes(),
		messages: {noResults:"",results:function(){}},
		select: function(event,ui){
			setTimeout(function(){AddressInput.select()},200);
			$([MultiLegislatorDisplay,ActiveLegislatorDisplay]).css({opacity:0,display:"inline"});
			ActivePerson=Json.People[ui.item.IdxPerson];
			ProfileActiveLegislator();
			$(ActiveLegislatorDisplay).css({display:"inline"}).animate({opacity:1});
		}
	});
}

function GetSearchAutoCompletes(){
	var Creep,ThisPerson,ReturnVar;
	ReturnVar=[];
	for(Creep in Json.People){
		ThisPerson=Json.People[Creep];
		ReturnVar.push({value:ThisPerson.FullName+", "+ThisPerson.TitleAbbr+", "+ThisPerson.AreaNameAbbr,IdxPerson:Creep});
	}
	return ReturnVar;
}

function SearchAddress(){
	if(AddressInput.value!=AddressInput.PriorValue){
		AddressInput.PriorValue=AddressInput.value;
		Geocoder.geocode({"address": AddressInput.value}, function(GeoRslts, status){
			if(status==google.maps.GeocoderStatus.OK){
				CheckAddress(GeoRslts);
				if(CheckAddress(GeoRslts)){
					DropMarker(GeoRslts[0].geometry.location,"AddressInput");
				}
			}else{
				Update_MainContent("Map");
				alert(status);
			}
		});
	}else{
		Update_MainContent("Map");
	}
}

function CheckAddress(GeoRslts){
	var Creep,ThisAddrArr,IfCountry,IfState;
	//dbug.push(GeoRslts);
	ThisAddrArr=GeoRslts[0].address_components;
	IfCountry=false;
	IfState=false;
	for(Creep=0;Creep<ThisAddrArr.length;Creep++){
		if(ThisAddrArr[Creep].long_name=="United States"){
			IfCountry=true;
		}else if(ThisAddrArr[Creep].short_name==ActiveState.Abbr){
			IfState=true;
		}
	}
	if(IfCountry && IfState){
		return true;
	}else{
		return false;
	}
}

function Inits_StageBottom(){
	StageBottom=$(".footer")[0];
	MultiLegislatorDisplay=$("#MultiLegislatorDisplay")[0];
		
	PointUp=$("<img>")//This feature temporarily offline
		.attr({id:"PointUp",src:AssetsPath+"GFX_PointUp.svg?"+VersionId})
		.css({position:"absolute",display:"none",opacity:0,width:30,zIndex:StageBottom.style.zIndex+1})
		.appendTo(document.body)[0];
		
	ActiveLegislatorDisplay=$("#ActiveLegislatorDisplay")[0];
	ActiveLegislatorDetailDiv=$("<div>")
		.attr({id:"ActiveLegislatorDetailDiv"})
		.css({opacity:0,display:"inline"})
		.appendTo(ActiveLegislatorDisplay)[0];
	ActiveLegislatorContactButtonsRow=$("<div>")
		.attr({id:"ActiveLegislatorContactButtonsRow"})
		.appendTo(ActiveLegislatorDisplay)[0];
	ActiveLegislatorContactEmail=$("<div>")
		.attr({id:"ActiveLegislatorContactEmail","class":"ContactButton"})
		.prop({WindowAction:"mailto:",ThisJson:"Email"})
		.appendTo(ActiveLegislatorContactButtonsRow)[0];
	ActiveLegislatorContactPhone=$("<div>")
		.attr({id:"ActiveLegislatorContactPhone","class":"ContactButton"})
		.prop({WindowAction:"tel:+1",ThisJson:"Phone"})
		.appendTo(ActiveLegislatorContactButtonsRow)[0];
	ActiveLegislatorContactWebsite=$("<div>")
		.attr({id:"ActiveLegislatorContactWebsite","class":"ContactButton"})
		.prop({WindowAction:"",ThisJson:"Website"})
		.appendTo(ActiveLegislatorContactButtonsRow)[0];
	ActiveLegislatorContactAddress=$("<div>")
		.attr({id:"ActiveLegislatorContactAddress","class":"ContactButton"})
		.prop({WindowAction:null,ThisJson:"Address"})
		.appendTo(ActiveLegislatorContactButtonsRow)[0];
	$(".ContactButton").bind({
		click:function(){
			var TmpWindow;
			UserAction(this.ThisJson+": "+this.Person.FullName+" (IDX:"+this.Person.IDX+") "+(this.Person[this.ThisJson]==""?"[n/a]":this.Person[this.ThisJson]));
			if(this.ThisJson!="Address" && this.WindowAction!=null && this.Person[this.ThisJson]!=""){
				if(this.ThisJson=="Email" && this.Person.Email.indexOf("@")==-1){
					this.WindowAction="";
				}
				TmpWindow=window.open(this.WindowAction+this.Person[this.ThisJson]);
				if(this.WindowAction!=""){
					TmpWindow.close();
				}
			}
			if(this.ThisJson=="Address" && this.Person.Address!=""){
				prompt("Copy to clipboard",this.Person.Address);
			}
		},
		mouseover:function(){
			ToolTipPos(this.Person[this.ThisJson]==""?"N/A":this.Person[this.ThisJson]);
			$(ToolTip).css({display:"block"}).animate({opacity:1});
		},
		mousemove:function(){
			ToolTipPos(this.Person[this.ThisJson]==""?"N/A":this.Person[this.ThisJson]);
		},
		mouseout:function(){
			$(ToolTip).css({display:"none",opacity:0});
		}
	});
		
	ActiveLegislatorVoteStats=$("<div>")
		.attr({id:"ActiveLegislatorVoteStats"})
		.appendTo(ActiveLegislatorDisplay)[0];
	ActiveLegislatorVoteStatsTable=$("<table>")
		.attr({id:"ActiveLegislatorVoteStatsTable"})
		.appendTo(ActiveLegislatorVoteStats)[0];

}

function Inits_StageMiddle(){
	StageMiddle=$(".main")[0];
	$(StageMiddle).css({padding:0});
	MainContentContainer=$("#maincontent_container")[0];
}

function Inits_StageExtras(){
	var Creep,IdList;
	IdList=["BillDetailMaster","BillDetailBG","BillDetailHeader1","BillDetailHeader2","BillDetailHeader3","BillDetailOpinionHeader","BillDetailOpinionBody","BillDetailLinksHeader","BillDetailLinksTable"];
	for(Creep=0;Creep<IdList.length;Creep++){
		window[IdList[Creep]]=$("#"+IdList[Creep])[0];
	}
	$(BillDetailBG).bind({
		click:function(){
			$([BillDetailMaster,BillDetailBG]).animate({opacity:0},function(){
				$([BillDetailMaster,BillDetailBG]).css({display:"none"});
			});
		}
	})
	$(BillDetailLinksHeader).bind({
		click:function(){
			if(BillDetailLinksTable.style.diplay=="none"){
				$(BillDetailLinksTable).css({opacity:0,display:"table"}).animate({opacity:1});
			}else{
				$(BillDetailLinksTable).animate({opacity:0},function(){
					$(BillDetailLinksTable).css({display:"none"});
				});
			}
			//$(BillDetailMaster).css({left:GetStats(BillDetailMaster).x2-BillDetailMaster.clientWidth,top:GetStats().y2-BillDetailMaster.clientHeight});
		}
	});
}

function Inits_ActiveMap(){
	Geocoder=new google.maps.Geocoder();
	
	ActiveMapDiv=$("<div>")
		.attr({id:"ActiveMapDiv"})
		.prop({HomeCenter:new google.maps.LatLng(39.41589950794853,-96.37418942578125),HomeZoom:5})
		.css({position:"relative",left:0,top:0,width:"100%",height:"100%",margin:0,zIndex:1})
		.appendTo(StageMiddle)[0];
	StyleOps=[
		{
			"elementType": "geometry.fill",
			"stylers": [
			  { "visibility": "on" },
			  { "saturation": -88 },
			  { "lightness": -8 },
			  { "gamma": 1.08 },
			  { "weight": 0.1 }
			]
		},{
			"featureType": "landscape.natural.terrain",
			"elementType": "geometry.fill",
			"stylers": [
			  { "visibility": "on" },
			  { "color": "#a0a898" },
			  { "saturation": -49 },
			  { "gamma": 0.77 }
			]
		},{
			"featureType": "road",
			"stylers": [
			  { "visibility": "off" }
			]
		},{
			"featureType": "poi",
			"elementType": "labels.icon",
			"stylers": [
			  { "visibility": "off" }
			]
		}
	];
	Ops={
		Center: ActiveMapDiv.HomeCenter,
		Zoom:ActiveMapDiv.HomeZoom,
		Tilt:45,
		Heading:0,
		mapTypeId:google.maps.MapTypeId.ROADMAP,
		mapTypeControl:true,
		mapTypeControlOptions: {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.TERRAIN,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID],
			style: google.maps.MapTypeControlStyle.DEFAULT,
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		panControl: true,
		panControlOptions: {
			position: google.maps.ControlPosition.LEFT_TOP
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE,
			position: google.maps.ControlPosition.LEFT_TOP
		},
		scaleControl: true,
		scaleControlOptions: {
			position: google.maps.ControlPosition.LEFT_TOP
		},
		streetViewControl: false,
		streetViewControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		},
		styles: StyleOps
	};
	ActiveMap=new google.maps.Map(ActiveMapDiv,Ops);
}

function Inits_ActiveState(){
	var Creep;
	//Active state determined by navigator.geolocation.getCurrentPosition(), ISP lookup, select your state option
	//Lookup Json will fill the following two variables
	ActiveState={
		Name:"North Carolina",
		Abbr:"NC"
	};
	Update_ActiveState();
}

function Update_ActiveState(){
	//Prep Load List
	DataFiles=[
		{Text:"StatesInfo",JsonName:"StatesInfo",Type:"GeneralInfo"},
		{Text:ActiveState.Abbr+" People",JsonName:"People",Type:"People"},
		{Text:ActiveState.Abbr+" Votes",JsonName:"Votes",Type:"Votes"},
		{Text:ActiveState.Abbr+" Legislation",JsonName:"Legislation",Type:"Legislation"},
		{Text:"State of "+ActiveState.Name,JsonName:"State",Type:"MapSets",Sort:0},
		{Text:ActiveState.Abbr+" Federal Congressional Districts",JsonName:"FederalCongressionalDistricts",Type:"MapSets",Sort:1},
		{Text:ActiveState.Abbr+" State Senate Districts",JsonName:"State_Upper",Type:"MapSets",Sort:2},
		{Text:ActiveState.Abbr+" State Assembly Districts",JsonName:"State_Lower",Type:"MapSets",Sort:3}
	];
	//Release Mem
	for(Creep=0;Creep<DataFiles.lenght;Creep++){
		Json[DataFiles[Creep].JsonName]="";
	}
	MapSets={};
	MapSetsArr=[];
	//Load Technique
	JsonLoader([0,1,2,3,4],function(){
		Update_ActiveMap();
		Inits_SearchAutoCompletes();
		setTimeout(function(){
			JsonLoader([5,6,7]);
		},1000);
	});
}

function JsonLoader(DataFilesIndexArr,OnCompleteFnc){
	var Creep,ThisDataFile,JsonCount;
	JsonCount=0;
	for(Creep=0;Creep<DataFilesIndexArr.length;Creep++){
		ThisDataFile=DataFiles[DataFilesIndexArr[Creep]];
		$.ajax({
			url:AssetsPath+(DataFiles[DataFilesIndexArr[Creep]].Type!="GeneralInfo"?ActiveState.Abbr+"_":"")+ThisDataFile.JsonName+".json?"+VersionId,
			type:"get",
			dataType:"json",
			context:{Creep:DataFilesIndexArr[Creep],DataFilesIndexArr:DataFilesIndexArr,OnCompleteFnc:OnCompleteFnc},
			error:function(a,b,c){
				//alert("Err: Json");
				console.log(a,b,c);
			},
			success:function(data){
				//window.localStorage.setItem("Json"+this.Creep,JSON.stringify(data));
				JsonUpdate({
					DataFilesIndex:this.Creep,
					ThisData:data
				});
				JsonCount++;
				if(JsonCount>=this.DataFilesIndexArr.length){
					if(typeof this.OnCompleteFnc!=="undefined" && this.OnCompleteFnc!=null){
						this.OnCompleteFnc();
					}
				}
			}
		});
	}
}

function JsonUpdate(Specs){
	var ThisDataFile,Creep,Creep2,ThisDistrict,ThisMapData,ThisLegislator;
	ThisDataFile=DataFiles[Specs.DataFilesIndex];
	Json[ThisDataFile.JsonName]=Specs.ThisData;
	if(ThisDataFile.JsonName=="State"){
		ActiveState.Center=new google.maps.LatLng(Specs.ThisData.Center[1],Specs.ThisData.Center[0]);
		ActiveState.Zoom=Specs.ThisData.Zoom;
	}
	if(ThisDataFile.Type=="MapSets"){
		//Update Mapset Objects
		Specs.ThisData.JsonName=ThisDataFile.JsonName;
		Specs.ThisData.Text=ThisDataFile.Text;
		Specs.ThisData.SortOrder=ThisDataFile.Sort;
		Specs.ThisData.Type="MapSets";
		MapSets[ThisDataFile.JsonName]=Specs.ThisData;
		MapSetsArr[ThisDataFile.Sort]=Specs.ThisData;
		//Temp fixes -- to be dealt w/ in DB
		if(ThisDataFile.JsonName=="FederalCongressionalDistricts"){
			//Adjust Area Name -- To Do: FMP to fix this
			for(Creep in Json["FederalCongressionalDistricts"].MapData){
				ThisDistrict=Json["FederalCongressionalDistricts"].MapData[Creep];
				ThisDistrict.AreaName="Federal Congressional District "+ThisDistrict.AreaName;
			}
		}
		GetMapData(Specs.ThisData);
	}
}


function Update_ActiveMap(){
	ActiveMap.panTo(ActiveState.Center);
	ActiveMap.setZoom(ActiveState.Zoom);
	Update_Areas("State");
	Update_MainContent("Map");
}

function GetMapData(ThisMapSet){
	var ThisMapData,ThisFillColor,ThisArea,Creep1,Creep2,Creep3,LatLngCount,MaxNorth,MaxSouth,MaxEast,MaxWest,AvgLat,AvgLng,LatLngActive,LatLngPrior;
	ThisMapData=ThisMapSet.MapData;
	for(Creep1 in ThisMapData){
		ThisArea=ThisMapData[Creep1];
		ThisArea.BorderPointsG=[];
		ThisArea.Polygons=[];
		MaxNorth=-90;
		MaxSouth=90;
		MaxEast=-180;
		MaxWest=180;
		LatLngCount=0;
		AvgLat=0;
		AvgLng=0;
		LatLngActive="";
		LatLngPrior="";
		for(Creep2=0;Creep2<ThisArea.BorderPoints.length;Creep2++){
			ThisArea.BorderPointsG[Creep2]=[];
			for(Creep3=0;Creep3<ThisArea.BorderPoints[Creep2].length;Creep3++){
				LatLngCount++;
				ThisArea.BorderPointsG[Creep2].push(new google.maps.LatLng(ThisArea.BorderPoints[Creep2][Creep3][1],ThisArea.BorderPoints[Creep2][Creep3][0]));
				AvgLat+=ThisArea.BorderPoints[Creep2][Creep3][1];
				AvgLng+=ThisArea.BorderPoints[Creep2][Creep3][0];
				MaxSouth=(ThisArea.BorderPoints[Creep2][Creep3][1]<MaxSouth ? ThisArea.BorderPoints[Creep2][Creep3][1] : MaxSouth);
				MaxNorth=(ThisArea.BorderPoints[Creep2][Creep3][1]>MaxNorth ? ThisArea.BorderPoints[Creep2][Creep3][1] : MaxNorth);
				MaxEast=(ThisArea.BorderPoints[Creep2][Creep3][0]>MaxEast ? ThisArea.BorderPoints[Creep2][Creep3][0] : MaxEast);
				MaxWest=(ThisArea.BorderPoints[Creep2][Creep3][0]<MaxWest ? ThisArea.BorderPoints[Creep2][Creep3][0] : MaxWest);
			}
			if(ThisArea.People.length==1){
				ThisPerson=Json.People[ThisArea.People[0]];
				if(typeof ThisPerson==="undefined" || typeof ThisPerson.Party==="undefined"){
					dbug.push(ThisArea);
				}
				if(ThisPerson.Party.substr(0,1).toLowerCase()=="r"){
					ThisFillColor="#f00";
				}else if(ThisPerson.Party.substr(0,1).toLowerCase()=="d"){
					ThisFillColor="#00f";
				}else{
					ThisFillColor="#f0f";
				}
			}else{
				ThisFillColor="#f0f"
			}
			ThisArea.Polygons.push(new google.maps.Polygon({
				fillColor:ThisFillColor,
				fillOpacity:.2,
				strokeColor:"#000000",
				strokeWeight:1,
				strokeOpacity:1,
				paths:ThisArea.BorderPointsG[Creep2],
				Area:ThisArea
			}));
			google.maps.event.addListener(ThisArea.Polygons[Creep2], "mouseover", function(e){
				ToolTipPos(this.Area.AreaName);
				$(ToolTip).css({display:"block"}).animate({opacity:1});
			});
			google.maps.event.addListener(ThisArea.Polygons[Creep2], "mousemove", function(e){
				ToolTipPos(this.Area.AreaName);
			});
			google.maps.event.addListener(ThisArea.Polygons[Creep2], "mouseout", function(e){
				$(ToolTip).css({display:"none",opacity:0});
			});
			google.maps.event.addListener(ThisArea.Polygons[Creep2],"click",function(e){
				DropMarker(e.latLng,"MapClick");
			});
		}
		AvgLat/=LatLngCount;
		AvgLng/=LatLngCount;
	}
}

function ToolTipPos(Html){
	var OffsetX,OffsetY,ReachX;
	OffsetX=0;
	OffsetY=-30;
	$(ToolTip).html(Html).css({display:"block"});
	if(MouseX<(window.innerWidth/2)-ToolTip.clientWidth){
		ToolTip.PosX=MouseX+OffsetX;
	}else if(MouseX>=window.innerWidth/2){
		ToolTip.PosX=MouseX+((ToolTip.clientWidth+OffsetX)*-1);
	}
	$(ToolTip).css({left:ToolTip.PosX,top:MouseY+OffsetY});
}

function GetContainingPolygons(MapPoint){
	var Creep1,Creep2,Creep3,ThisMapSet,ThisPolgyons,ThisPolygon,PolygonsArr;
	PolygonsArr=[];
	for(Creep1=0;Creep1<MapSetsArr.length;Creep1++){
		ThisMapSet=MapSetsArr[Creep1].MapData;
		for(Creep2 in ThisMapSet){
			ThisPolygons=ThisMapSet[Creep2].Polygons;
			for(Creep3=0;Creep3<ThisPolygons.length;Creep3++){
				ThisPolygon=ThisPolygons[Creep3];
				if(google.maps.geometry.poly.containsLocation(MapPoint, ThisPolygon)){
					PolygonsArr.push(ThisPolygon.Area);
				}
			}
		}
	}
	return PolygonsArr;
}

function BuildToolTipFromMarker(PolygonsArr){
	var Txt,Creep1,Creep2;
	Txt="<div class='ToolTipHeader'>LEGISLATORS AT THIS LOCATION</div>";
	for(Creep1=0;Creep1<PolygonsArr.length;Creep1++){
		ThisPolygon=PolygonsArr[Creep1];
		Txt+="<br><div class='ToolTipAreaHeader'>"+ThisPolygon.AreaName+"</div>";
		if(typeof ThisPolygon.People!=="undefined"){
			for(Creep2=0;Creep2<ThisPolygon.People.length;Creep2++){
				ThisIdxPeople=ThisPolygon.People[Creep2];
				if(typeof Json.People[ThisIdxPeople]!=="undefined"){
					ThisPerson=Json.People[ThisIdxPeople+""];
					Txt+="<li class='ToolTipPerson'>";
					Txt+=ThisPerson.TitleAbbr+(ThisPerson.TitleAbbr!=""?" ":"")+ThisPerson.FullName+" ("+ThisPerson.Party.substr(0,1)+")";
					if(ThisPerson.Fracker=="X"){
						Txt+=" <span class='ToolTipFrackerPro'>FRACKER</span>";
					}else if(ThisPerson.VoteScore>0){
						Txt+=" <span class='ToolTipFrackerAnti'>ANTI-FRACKER</span>";
					}
					Txt+="</li>"
				}
			}
		}else{
			Txt+="<li>[TBD]</li>";
		}
	}
	return Txt;
}

function DropMarker(MapPoint,Source){
	var Creep1,Creep2,Creep3;
	Update_MainContent("Map");
	$(".LegislatorDiv, .ContactButton, #ActiveLegislatorVoteStats").css({opacity:0});
	$(PointUp).animate({opacity:0},function(){
		$(PointUp).css({display:"none"});
	});
	$(ActiveLegislatorDisplay).animate({opacity:0},function(){
		$(ActiveLegislatorDisplay).css({opacity:0,display:"none"});
	});
	//ActiveMap.setZoom(ActiveState.Zoom);
	//ActiveMap.setCenter(ActiveState.Center);
	if(typeof ActiveMarker!=="undefined"){
		ActiveMarker.setMap(null);
	}
	ActiveMarker=new google.maps.Marker();
	ActiveMarker.setPosition(MapPoint);
	ActiveMarker.setAnimation(google.maps.Animation.DROP);
	ActiveMarker.Polygons=GetContainingPolygons(MapPoint);
	ActiveMarker.Txt=BuildToolTipFromMarker(ActiveMarker.Polygons);
	//ActiveMarker.People=GetLegislatorsFromPolygonsArr(ActiveMarker.Polygons);
	GetLegislatorsFromLatLngSunlight(ActiveMarker);
	ActiveMarker.setMap(ActiveMap);
	ActiveMap.panTo(MapPoint);
	if(ActiveMap.getZoom()<9){
		setTimeout(function(){ActiveMap.setZoom(9)},800);
	}
	google.maps.event.addListener(ActiveMarker,"click",function(e){
		$(ToolTip)
			.css({display:"block",left:MouseX+25,top:MouseY-20})
			.html(this.Txt)
			.animate({opacity:1});
	});
	google.maps.event.addListener(ActiveMarker,"mouseover",function(e){
		$(ToolTip)
			.css({display:"block",left:MouseX+25,top:MouseY-20})
			.html(this.Txt)
			.animate({opacity:1});
	});
	google.maps.event.addListener(ActiveMarker,"mousemove",function(e){
		$(ToolTip).css({display:"block",left:MouseX+25,top:MouseY-20});
	});
	google.maps.event.addListener(ActiveMarker,"mouseout",function(e){
		$(ToolTip).css({display:"none",opacity:0});
	});
	if(Source=="MapClick"){
		$.ajax({
			url:PhpPath,
			type:"post",
			dataType:"json",
			data:{
				Action:"ZipFromLatLng",
				Lat:MapPoint.lat(),
				Lng:MapPoint.lng()
			},
			error:function(a,b,c){
				alert("Geocode error");
				console.log(a,b,c);
			},
			success:function(data){
				AddressInput.Json=data;
				AddressInput.Results=AddressInput.Json.results[0];
				AddressInput.value=AddressInput.Results.formatted_address;
				//AddressInput.LastResult=AddressInput.Results.address_components[AddressInput.Results.address_components.length-1];
				//AddressInput.LastResultType=AddressInput.LastResult.types[0];
				//if(AddressInput.LastResultType=="postal_code"){
				//	AddressInput.value=AddressInput.LastResult.short_name;
				//}else{
				//	AddressInput.value="[no zip here]"
				//}
			}
		});
	}
	return ActiveMarker
}

function GetLegislatorsFromLatLngSunlight(ThisMarker){
	var Legislators;
	$.ajax({
		url:PhpPath,
		type:"post",
		dataType:"json",
		data:{
			Action:"GetLegislatorsFromLatLng",
			Lat:ThisMarker.getPosition().lat(),
			Lng:ThisMarker.getPosition().lng()
		},
		error:function(a,b,c){
			//alert("err");
			console.log("GetLegislatorsFromLatLngSunlight err",a,b,c);
		},
		success:function(data){
			//Legislators=$.parseJSON(data);
			Legislators=data;
			Legislators[0].push.apply(Legislators[0],Legislators[1].results);
			Legislators=Legislators[0];
			ThisMarker.Legislators=Legislators;
			DisplayLegislators(ThisMarker.Legislators);
		}
	});
}

function DisplayLegislators(Legislators){
	MultiLegislatorDisplay.innerHTML="";
	ActiveLegislators=[];
	for(Creep1=0;Creep1<Legislators.length;Creep1++){
		ThisLegislator=Legislators[Creep1];
		ThisPerson=GetPersonFromLegislator(ThisLegislator);
		ActiveLegislators.push([ThisLegislator,ThisPerson]);
		ThisLegislatorDiv=$("<div>")
			.attr({"class":"LegislatorDiv"})
			.prop({Legislator:ThisLegislator,Person:ThisPerson,DefaultCss:{border:"1px solid rgba(255,255,255,0)",backgroundColor:"rgba(129, 129, 129,.5)"},SelectCss:{border:"1px solid rgba(180,180,50,.8)",backgroundColor:"rgba(180, 180, 50,.3)"}})
			//.css({"float":"left",width:120,height:100+45,border:"1px solid rgba(255,255,255,0)"})
			.bind({
				click:function(){
					ActiveLegislatorDiv=this;
					ActiveLegislator=this.Legislator;
					ActivePerson=this.Person;
					PointToLegislator(this);
					ProfileActiveLegislator(this);
				}
			})
			.appendTo(MultiLegislatorDisplay)[0];
		FillLegislatorDiv(ThisLegislatorDiv,ThisPerson);
	}
	$([StageBottom,MultiLegislatorDisplay]).css({opacity:0,display:"inline"}).animate({opacity:1});
}

function FillLegislatorDiv(ThisLegislatorDiv,ThisPerson){
		//dbug.push([ThisLegislatorDiv,ThisPerson]);
		$(ThisLegislatorDiv).css({opacity:0}).html("");
		ThisLegislatorPhotoDiv=$("<div>")
			.prop({"class":"LegislatorPhotoDiv"})
			.appendTo(ThisLegislatorDiv)[0];
		if(ThisPerson!=""){
			ThisLegislatorPhotoImg=$("<img>")
				.attr({"class":"LegislatorPhotoImg",src:ThisPerson.PhotoUrl})
				.appendTo(ThisLegislatorPhotoDiv)[0];
		}
		if(ThisPerson.Fracker=="X"){
			ThisLegislatorFrackerBanner=$("<div>")
				.attr({"class":"LegislatorFrackerBanner LegislatorFrackerBannerPro"})
				.html("FRACKER")
				.animate({opacity:1})
				.appendTo(ThisLegislatorPhotoDiv)[0];
		}else if(ThisPerson.Fracker=="X2"){
			ThisLegislatorFrackerBanner=$("<div>")
				.attr({"class":"LegislatorFrackerBanner LegislatorFrackerBannerPro2"})
				.html("FRACKER")
				.animate({opacity:1})
				.appendTo(ThisLegislatorPhotoDiv)[0];
		}else if(ThisPerson.VoteScore>0){
			ThisLegislatorFrackerBanner=$("<div>")
				.attr({"class":"LegislatorFrackerBanner LegislatorFrackerBannerAnti"})
				.html("ANTI-FRACKER")
				.animate({opacity:1})
				.appendTo(ThisLegislatorPhotoDiv)[0];
		}
		ThisLegInfoDiv=$("<div>").appendTo(ThisLegislatorDiv)
			.attr({"class":"LegInfoDiv"})
			.html(ThisPerson!=""?ThisPerson.FullName+" ("+ThisPerson.Party.substr(0,1)+")<br>"+ThisPerson.ChamberName+"<br>"+ThisPerson.AreaNameAbbr:"")
		$(ThisLegislatorDiv).animate({opacity:1});
}

function GetPersonFromLegislator(ThisLegislator){
	var Creep,FieldLinks,ThisFieldLink,ThisPerson,ReturnPerson,CountPersons;
	FieldLinks=[
		{Sql:"leg_id",Fmp:"LegId"},
		{Sql:"bioguide_id",Fmp:"BioguideId"},
		{Sql:"votesmart_id",Fmp:"VotesmartId"}
		];
	for(Creep=0;Creep<FieldLinks.length;Creep++){
		if(typeof ThisLegislator[FieldLinks[Creep].Sql]!=="undefined"){
			ThisFieldLink=FieldLinks[Creep];
			Creep=FieldLinks.length;
		}
	}
	CountPersons=0;
	for(Creep in Json.People){
		ThisPerson=Json.People[Creep];
		if(ThisPerson[ThisFieldLink.Fmp]==ThisLegislator[ThisFieldLink.Sql]){
			CountPersons++;
			ReturnPerson=ThisPerson;
		}
	}
	if(CountPersons!=1){
		ReturnPerson="";
		console.log("Legislator count: "+CountPersons,ThisLegislator);
	}
	return ReturnPerson;
}

function PointToLegislator(ThisLegislatorDiv){
	var AreaJsonName;
	//Pointer feature off
// 	if(PointUp.style.display=="none"){
// 		$(PointUp).css({opacity:0,display:"block",left:GetStats(ThisLegislatorDiv).xMidAbs,top:GetStats(ThisLegislatorDiv).y2Abs-30});
// 	}			
// 	$(PointUp).animate({left:GetStats(ThisLegislatorDiv).xMidAbs-(PointUp.clientWidth/2),top:GetStats(ThisLegislatorDiv).y2Abs-40,opacity:1},function(){
// 		Update_Areas(AreaJsonName);
// 	});
	//Alternative to Pointer Feature
	$(PointUp).css({display:"none"});
	
	
	$(".LegislatorPhotoDiv").css(ThisLegislatorDiv.DefaultCss);
	$(ThisLegislatorDiv.getElementsByClassName("LegislatorPhotoDiv")).css(ThisLegislatorDiv.SelectCss);
	if(ThisLegislatorDiv.Person.GovernmentLevel=="State"){
		AreaJsonName="State_"+ThisLegislatorDiv.Person.Chamber;
	}else if(ThisLegislatorDiv.Person.Chamber=="Upper"){
		AreaJsonName="State";
	}else if(ThisLegislatorDiv.Person.Chamber=="Lower"){
		AreaJsonName="FederalCongressionalDistricts";
	}
	Update_Areas(AreaJsonName);
}

function ProfileActiveLegislator(){
	var Creep,Creep2,ThisVoteIdx,TheseFields,ThisVoteIdx,ThisVote,ThisRow,ThisCell;
	FillLegislatorDiv(ActiveLegislatorDetailDiv,ActivePerson);
	$(ActiveLegislatorDetailDiv).animate({opacity:1});
	$(".ContactButton, #ActiveLegislatorVoteStats").css({opacity:0});
	$(ActiveLegislatorDetailDiv).attr({id:"ActiveLegislatorDetailDiv"});
	$(ActiveLegislatorContactEmail).html("EMAIL").prop({Person:ActivePerson});
	$(ActiveLegislatorContactPhone).html("PHONE").prop({Person:ActivePerson});
	$(ActiveLegislatorContactWebsite).html("WEBSITE").prop({Person:ActivePerson});
	$(ActiveLegislatorContactAddress).html("MAILING ADDRESS").prop({Person:ActivePerson});
	$(ActiveLegislatorDisplay).css({display:"inline"}).animate({opacity:1});
	$(".ContactButton, #ActiveLegislatorVoteStats").animate({opacity:1});
	
	$(ActiveLegislatorVoteStatsTable).find("tr").remove();
	TheseFields=[
		{Json:"DateStamp",Header:"Date"},
		{Json:"BillId",Header:"Bill"},
		{Json:"Vote",Header:"Voted"},
		{Json:"VoteScore",Header:"Score"},
		{Json:"LegislationTitle",Header:"Title"}
	];
	if(ActivePerson.Votes.length>0){
		for(Creep=-1;Creep<ActivePerson.Votes.length;Creep++){
			ThisVoteIdx=ActivePerson.Votes[Creep];
			ThisVote=Json.Votes[ThisVoteIdx];
			ThisRow=$("<tr class='ActiveLegislatorVoteStatsRow'>")
				.appendTo(ActiveLegislatorVoteStatsTable)[0];
			if(Creep>-1){
				ThisDateSpan=$("<td>")
					.html(ThisVote.DateStamp)
					.appendTo(ThisRow)[0];
				ThisVoteSpan=$("<td>")
					.appendTo(ThisRow)[0];
					[0];
				if(ThisVote.VoteScore==-1){
					ThisVoteSpan.innerHTML="VOTED "+ThisVote.Vote;
					ThisVoteSpan.className="ActiveLegislatorVoteTextCell VoteSpanProFrack";
				}else if(ThisVote.VoteScore==1){
					ThisVoteSpan.innerHTML="VOTED "+ThisVote.Vote;
					ThisVoteSpan.className="ActiveLegislatorVoteTextCell VoteSpanAntiFrack";
				}else{
					ThisVoteSpan.innerHTML="TBD regarding "+ThisBillTxt+", "+ThisVote.DateStamp;
					ThisVoteSpan.className="VoteSpanTBDFrack";
				}
				$("<td>").html("on").appendTo(ThisRow)[0];
				ThisBillSpan=$("<td>")
					.prop({IdxLegislation:ThisVote.IdxLegislation})
					.html(ThisVote.BillId)
					.css({cursor:"pointer"})
					.bind({
						click:function(){
							ShowBillDetail(this.IdxLegislation);
						}
					})
					.appendTo(ThisRow)[0];
				if(ThisVote.LegislationScore==-1){
					ThisBillSpan.className="ActiveLegislatorVoteTextCell VoteSpanProFrack";
				}else if(ThisVote.LegislationScore==1){
					ThisBillSpan.className="ActiveLegislatorVoteTextCell VoteSpanAntiFrack";
				}
			}
		}
	}
}

function ShowBillDetail(IdxLegislation){
	var Creep,ThisRow;
	$([BillDetailMaster,BillDetailBG]).css({opacity:0,display:"block"});
	BillDetailHeader1.innerHTML=(Json.Legislation[IdxLegislation].GovernmentLevel=="Federal"?"US":Json.Legislation[IdxLegislation].State+" State")+" Bill";
	BillDetailHeader2.innerHTML=Json.Legislation[IdxLegislation].BillId+" (Session "+Json.Legislation[IdxLegislation].Session+")";
	BillDetailHeader3.innerHTML=Json.Legislation[IdxLegislation].Title;
	BillDetailOpinionBody.innerHTML=Json.Legislation[IdxLegislation].Opinion;
	//$(BillDetailLinksHeader).css({display:(Json.Legislation[IdxLegislation].Links.length==0?"none":"inline")});
	//$(BillDetailLinksTable).find("tr").remove();
// 	for(Creep=0;Creep<Json.Legislation[IdxLegislation].Links.length;Creep++){
// 		ThisRow=$("<tr>")
// 			.appendTo(BillDetailLinksTable)[0];
// 		ThisCell=$("<td>")
// 			.appendTo(ThisRow)[0];
// 		ThisA=$("<a>")
// 			.attr({href:Json.Legislation[IdxLegislation].Links[Creep]})
// 			.html(Json.Legislation[IdxLegislation].Links[Creep])
// 			.appendTo(ThisCell)[0];
// 	}
	$(BillDetailBG).animate({opacity:.5});
	$(BillDetailMaster).css({left:MouseX-BillDetailMaster.clientWidth,top:MouseY-BillDetailMaster.clientHeight});
	$(BillDetailMaster).animate({opacity:1});
}

function LeaderList(){
	//var Creep1,Creep2,Creep3,ThisArea,ThisMapSet,ThisLegislator,Ouptut;
	Output="";
	for(Creep1=0;Creep1<MapSetsArr.length;Creep1++){
		ThisArea=MapSetsArr[Creep1];
		for(Creep2 in ThisArea.MapData){
			ThisMapSet=ThisArea.MapData[Creep2];
			if(typeof ThisMapSet.People==="undefined"){
				Output+=ThisMapSet.IDX+"\t"+ThisMapSet.AreaName+"\t"+"[TBD]"+"\t"+"[TBD]"+"\r";
			}else{
				for(Creep3=0;Creep3<ThisMapSet.People.length;Creep3++){
					ThisLegislator=ThisMapSet.People[Creep3];
					Output+=ThisMapSet.IDX+"\t"+ThisMapSet.AreaName+"\t"+ThisLegislator.full_name+"\t"+(typeof ThisLegislator.Party!=="undefined"?ThisLegislator.Party:"[Party TBD]")+"\r";
				}
			}
		}
	}
	return Output;
}

function Inits_AreaSelect(){
	var Creep;
	AreaSelect=$("<select>")
		.attr({id:"AreaSelect"})
		//.css({/*,opacity:0,display:"none",left:GetStats(AddressInput).x2+5,top:GetStats(AddressInput).y1,zIndex:1*/})
		.animate({opacity:1})
		.bind({
			change:function(){
				Update_Areas(this.value);
				this.blur();
			}
		})
		.appendTo(StageMiddle)[0];
	for(Creep=0;Creep<DataFiles.length;Creep++){
		if(DataFiles[Creep].Type=="MapSets"){
			AreaSelect.Option=$("<option>").appendTo(AreaSelect)
				.attr({value:DataFiles[Creep].JsonName})
				.html("Map showing "+DataFiles[Creep].Text)
				[0];
		}
	}
	if(AddressInput.value!=AddressInput.PriorValue){
		SearchAddress();
	}
}

function Inits_MapTypeDiv(){
	MapTypeDiv=$("<div>")
		.attr({id:"MapTypeDiv"})
		.css({position:"relative",display:"inline",opacity:0,textAlign:"center",backgroundColor:"rgba(7,7,7,.5)",padding:-1,border:"1px solid rgba(0,0,0,.3)",borderRadius:0,zIndex:StageBottom.style.zIndex+1})
		.appendTo(StageMiddle)[0];
	MapTypeTxt=$("<div>")
		.attr({id:"MapTypeTxt"})
		.css({float:"left",fontFamily:"Helvetica",fontSize:12,fontWeight:900,color:"#fafafa"})
		.html("Map showing")
		.appendTo(MapTypeDiv)[0];
}

function Update_Areas(ActiveAreaJsonName){
	var Creep,ThisMapSet,ThisOnOff,ThisArea;
	//Self Init Map Label (Move to inits)
	//if(typeof MapTypeDiv==="undefined"){
		//Inits_MapTypeDiv();
	//}
	//$(MapTypeDiv).css({opacity:0});
	if(typeof AreaSelect==="undefined"){
		Inits_AreaSelect();
	}
	$(AreaSelect).css({opacity:0});
	ActiveMapSet=MapSets[ActiveAreaJsonName];
	for(Creep in MapSets){
		Update_MapSet(MapSets[Creep]);
	}
	//Update map label
	AreaSelect.value=ActiveAreaJsonName;
	$(AreaSelect).css({left:1,top:-22,paddingLeft:3}).animate({opacity:1});
	//$(MapTypeDiv)
		//.html("Map showing "+tbd)//MapSets[ActiveAreaJsonName].Text
		//.css({left:1,top:-22,paddingLeft:3,paddingRight:3})
		//.animate({opacity:1})
		//;
}

function Update_MapSet(ThisMapSet){
	var Creep1,Creep2,ThisArea,ThisPolygon;
	for(Creep1 in ThisMapSet.MapData){
		ThisArea=ThisMapSet.MapData[Creep1];
		for(Creep2=0;Creep2<ThisArea.Polygons.length;Creep2++){
			ThisPolygon=ThisArea.Polygons[Creep2];
			if(ThisMapSet==ActiveMapSet){
				ThisPolygon.setMap(ActiveMap);
			}else{
				ThisPolygon.setMap(null);
			}
		}
	}
}

function GetStats(obj,Specs){
	var x1, y1, x2, y2, xLength, yLength, xMid, yMid, x1Abs, y1Abs, x1AbsTrack, y1AbsTrack, x2Abs, y2Abs, objTrack, idTrack, zIndex, priors;
	if(typeof obj===undefined){
		console.log(arguments);
	}
	if(typeof Specs!=="undefined" && typeof Specs.Ref!=="undefined"){
		//console.log(Specs.Ref);
	}
	if(typeof obj.style.display!=="undefined" && obj.style.display=="none"){
		priors={
			position:obj.style.position,
			display:obj.style.display,
			visibility:obj.style.visibility,
			opacity:obj.style.opacity
		};
	}
	x1=obj.offsetLeft;
	y1=obj.offsetTop;
	xLength=obj.clientWidth;
	yLength=obj.clientHeight;
	x2=x1+xLength;
	y2=y1+yLength;
	xMid=x1+(xLength/2);
	yMid=y1+(yLength/2);
	x1Abs=0;
	y1Abs=0;
	x1AbsTrack=[];
	y1AbsTrack=[];
	objTrack=[];
	idTrack=[];
	if(obj.parentNode){
		do{
			if(typeof Specs==="undefined" || typeof Specs.ExcludeElements==="undefined" || Specs.ExcludeElements.indexOf(TypeOf(obj))==-1){
				x1Abs+=(typeof obj.offsetLeft==="undefined" ? 0 : obj.offsetLeft);
				y1Abs+=(typeof obj.offsetTop==="undefined" ? 0 : obj.offsetTop);
				x1AbsTrack.push(obj.offsetLeft);
				y1AbsTrack.push(obj.offsetTop);
				objTrack.push(obj);
				idTrack.push(obj.id);
			}
		}while(obj=obj.parentNode);
	}else{
		x1Abs=x1;
		y1Abs=y1;
	}
	x2Abs=x1Abs+xLength;
	y2Abs=y1Abs+yLength;
	xMidAbs=(x1Abs+x2Abs)/2;
	yMidAbs=(y1Abs+y2Abs)/2;
// 	if(typeof priors!=="undefined"){
// 		ApplyCSS(obj,priors);
// 	}
	return {x1:x1, y1:y1, x2:x2, y2:y2, xLength:xLength, yLength:yLength, xMid:xMid, yMid:yMid, x1Abs:x1Abs, y1Abs:y1Abs, x1AbsTrack:x1AbsTrack, y1AbsTrack:y1AbsTrack, x2Abs:x2Abs, y2Abs:y2Abs, xMidAbs:xMidAbs, yMidAbs:yMidAbs, objTrack:objTrack, idTrack:idTrack};
}

function Inits_ToolTip(Txt, Specs) {
	ToolTip=$("#ToolTip")[0];
	ToolTip.Lock="off";
}

function GenDiv(DivName){
	window[DivName]=$("<div>").appendTo(document.body)
		.attr({id:DivName})
		.css({position:"absolute",opacity:0})
		[0];
}

function GetMouseInit(){
	document.addEventListener("mousemove",function(e){GetMouseXY(e)},false);
	/*$(document).mousemove(function(e){GetMouseXY(e);});*/
	/*$(document).click(function(e){GetMouseXY(e);});*/
	MouseX = 0;
	MouseY = 0;
}

function GetMouseXY(e) {
	MouseX=e.pageX;
	MouseY=e.pageY;
	MouseX=(MouseX<0?0:MouseX);
	MouseY=(MouseY<0?0:MouseY);
	return {MouseX:MouseX,MouseY:MouseY};
}

function SecurityTest(SendVar){
	$.ajax({
		url:PhpPath,
		type:"post",
		data:{
			Action:"SecurityTest",
			SendVar:SendVar
		},
		success:function(data){
			output=data;
			console.log("var Returned: "+data);
		}
	});
	return "Var Sent: "+SendVar;
}

function Inits_Splash(){
	if(true){
		//TBD
	}else{
		SplashBG=$("<div>")
			.attr({id:"SplashBG"})
			.css({position:"absolute",left:0,top:0,backgroundColor:"#fff",width:document.body.scrollWidth,height:document.body.scrollHeight,zIndex:99,opacity:0})
			.appendTo(document.body)[0];
		$(SplashBG).animate({opacity:.9});
		Splash=$("<img>")
			.attr({id:"Splash",src:AssetsPath+"GFX_TheFutureHomeOf.svg?"+VersionId})
			.css({position:"absolute",left:433,top:155,zIndex:100,opacity:0})
			.bind({
				load:function(){
					$(this).animate({opacity:1});
					$("<input>")
						.attr({id:"Login",type:"password",placeholder:"LOGIN"})
						.css({position:"absolute",left:GetStats(Splash).x1,top:GetStats(Splash).y2,fontSize:20,zIndex:101})
						.bind({
							change:function(){
								$.ajax({
									type:"post",
									url:PhpPath,
									data:{Action:"Login",Pwd:this.value},
									error:function(a,b,c){
										//alert("fail");
										console.log("Splash err",a,b,c);
									},
									success:function(data){
										if(data=="success"){
											SplashClear();
										}else{
											alert("Password NG");
										}
									}
								});
							}
						})
						.appendTo(document.body)[0];
				}
			})
			.appendTo(document.body)[0];
	}
	SplashClear=function(){
		Login.value="";
		//$(SiteHeader).animate({opacity:1});
		$([Splash,SplashBG,Login]).animate({opacity:0},function(){
			$([Splash,SplashBG]).css({display:"none"});
		});
	};
}

function TypeOf(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1];
}

function UserAction(Txt){
	//Do gaq
	//Sqlize
	//console.log(Txt);
}
