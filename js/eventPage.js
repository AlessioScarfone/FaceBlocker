setDefaultPerson();

chrome.contextMenus.removeAll();

chrome.contextMenus.create({ id: "Add","title": "Add Face to Person", "contexts":["image"]});

getPersonList(function(result){
    var personlist=result.person;
    var person_name=[];
    personlist.forEach(function(elem){
        person_name.push(elem.person_name);
    });
    person_name.forEach(function(elem){
        chrome.contextMenus.create({ id: elem,title: elem, parentId: "Add",contexts:["image"]});
    });
});


chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var p_name_to_add=info.menuItemId;
    var img_url=info.srcUrl;

    var img = new Image();
    img.src = img_url;
    img.addEventListener("load", function(){
        var height = img.height;
        var width = img.width;

        if(height>=250 || height>=250){
            detectFromUrl(img_url,function(result){
                var face_ids=[];
                for(var index=0;index<result.face.length;index++)
                    face_ids.push(result.face[index].face_id);
                console.log(result.face.length);
                if(face_ids.length>1){
                    chrome.notifications.create(createNotificationOption("Error","Too many faces."));
                    return;
                }
                if(face_ids.length==0){
                    chrome.notifications.create(createNotificationOption("Error","No Face Detected."));
                    return;
                }
                else{
                    addFace(face_ids[0],p_name_to_add,function(result){
                        chrome.notifications.create(createNotificationOption("Success","Face Added."));
                    },function(err){
                        chrome.notifications.create(createNotificationOption("Error","Impossible to add face, retry:"+err.error));
                    });
                }
            },function(err){
                chrome.notifications.create(createNotificationOption("Error",err.error));
            });
        }       //END IF CHECK DIMENSION
        else{
            chrome.notifications.create(createNotificationOption("Error","Image too small."));
        }
    }); //END LOAD EVENT LISTENER
});

/**
 * Create option for create a chrome notification
 * @param   {string} title   Title of notification
 * @param   {string} message Body of notification
 * @returns {Object}   option for chrome notification
 */
function createNotificationOption(title,message){
    var iconURL;

    if(title=="Error")
        iconURL="img/error.png";
    else if(title=="Success")
        iconURL="img/success.png";
    else
        iconURL="img/icon128.png";

    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: iconURL
    }
    return opt;
}

/**
 * Set Default Person if current person to block is undefined
 */
function setDefaultPerson(){
    chrome.storage.local.get("selectedPerson", function (returnData) {
        var p_name = returnData.selectedPerson;
        if(p_name===undefined || p_name===null){
            getPersonList(function(res){
                p_name=res.person[0].person_name;
                chrome.storage.local.set({"selectedPerson":p_name});
            });
        }
    });
}