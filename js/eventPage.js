var errorCodeList = {
    1001: "INTERNAL_ERROR",
    1003: "AUTHORIZATION_ERROR or INSUFFICIENT_PRIVILEGE_OR_QUOTA_LIMIT_EXCEEDED",
    1004: "MISSING_ARGUMENTS",
    1005: "INVALID_ARGUMENTS",
    1006: "ILLEGAL_USE_OF_DEMO_KEY",
    1008: "TOO_MANY_ITEMS_TO_ADD",
    1202: "SERVER_TOO_BUSY",
    1301: "IMAGE_ERROR_UNSUPPORTED_FORMAT",
    1302: "IMAGE_ERROR_FAILED_TO_DOWNLOAD",
    1303: "IMAGE_ERROR_FILE_TOO_LARGE",
    1304: "IMAGE_ERROR",
    1501: "BAD_NAME",
    1502: "BAD_TAG",
    1503: "NAME_EXIST",
    "-1": "Error to contact server"
}
var resizeRatio = 4;
var minWidth = 250;
var minHeight = 250;

setDefaultPerson();

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
    id: "Add",
    "title": "Add Face to Person",
    "contexts": ["image"]
});

getPersonList(function (result) {
    var personlist = result.person;
    var person_name = [];
    personlist.forEach(function (elem) {
        person_name.push(elem.person_name);
    });
    person_name.forEach(function (elem) {
        chrome.contextMenus.create({
            id: elem,
            title: elem,
            parentId: "Add",
            contexts: ["image"]
        });
    });
});


chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var p_name_to_add = info.menuItemId;
    var img_url = info.srcUrl;
    var img = new Image();
    img.src = img_url;
    if (isDataUri(img_url) === false) {
        img.addEventListener("load", function () {
            var height = img.height;
            var width = img.width;
//            console.log(width + "x" + height);
            if (width >= minWidth || height >= minHeight) {
                detectFromUrl(img_url, function (result) {
                    var face_ids = [];
                    for (var index = 0; index < result.face.length; index++)
                        face_ids.push(result.face[index].face_id);
//                    console.log(result.face.length);
                    checkFaceId(face_ids, p_name_to_add);
                }, function (err) {
                    //resize image to big and addFace
                    if (err == "1303") {
                        chrome.notifications.create(createNotificationOption("Wait", errorCodeList[err]));
                        addTooBigImage(img_url, p_name_to_add);
                    } else {
                        chrome.notifications.create(createNotificationOption("Error", errorCodeList[err]));
                    }
                });
            } //END IF CHECK DIMENSION
            else {
                chrome.notifications.create(createNotificationOption("Error", "Image too small."));
            }
        }); //END LOAD EVENT LISTENER
    } else {
//        console.log("DATAURI");
        var blob = window.dataURLtoBlob && window.dataURLtoBlob(img_url);
        checkFaceFromBlob(blob,p_name_to_add);
    }
});

/**
 * Detect face and try to add face from a blob
 * @param {object} blob blob object of image
 */
function checkFaceFromBlob(blob,p_name_to_add){
    detectFromFileSync(blob).then(function (result) {
        var face_ids = [];
        for (var index = 0; index < result.face.length; index++)
            face_ids.push(result.face[index].face_id);
        checkFaceId(face_ids, p_name_to_add);
    }, function (err) {
        chrome.notifications.create(createNotificationOption("Error", errorCodeList[err]));
    }); //END DETECT
}

/**
 * Check if image contain only one face
 * @param {Array}  face_ids      Array of face id
 * @param {string} p_name_to_add person's name where add face
 */
function checkFaceId(face_ids, p_name_to_add) {
    if (face_ids.length > 1) {
        chrome.notifications.create(createNotificationOption("Error", "Too many faces."));
        return;
    }
    if (face_ids.length == 0) {
        chrome.notifications.create(createNotificationOption("Error", "No Face Detected."));
        return;
    } else {
        addFace(face_ids[0], p_name_to_add, function (result) {
            chrome.notifications.create(createNotificationOption("Success", "Face Added."));
        }, function (err) {
            chrome.notifications.create(createNotificationOption("Error", "Impossible to add face, retry:" + errorCodeList[err]));
        });
    }
}
/**
 * Try to add face to person when the image is bigger the 3MB 
 * @param {string} img_url       Image Url
 * @param {string} p_name_to_add person's name where add face
 */
function addTooBigImage(img_url, p_name_to_add) {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");
    var imgToResize = new Image();
    imgToResize.onload = function () {
        var w = imgToResize.width;
        var h = imgToResize.height;
        canvas.width = w / resizeRatio;
        canvas.height = h / resizeRatio;
        canvasContext.drawImage(imgToResize, 0, 0, w / resizeRatio, h / resizeRatio);

        //        $("body").append(canvas);
        if (canvas.toBlob) {
            canvas.toBlob(
                function (blob) {
                    checkFaceFromBlob(blob);
                },
                'image/jpeg'
            );
        }

    }
    imgToResize.src = img_url;
}

/**
 * Create option for create a chrome notification
 * @param   {string} title   Title of notification
 * @param   {string} message Body of notification
 * @returns {Object}   option for chrome notification
 */
function createNotificationOption(title, message) {
    var iconURL;

    if (title == "Error")
        iconURL = "img/error.png";
    else if (title == "Success")
        iconURL = "img/success.png";
    else if (title == "Wait") {
        iconURL = "img/wait.png";
        message = "Image is too big. We try to resize and add to person.";
    } else
        iconURL = "img/icon128.png";

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
function setDefaultPerson() {
    chrome.storage.local.get("selectedPerson", function (returnData) {
        var p_name = returnData.selectedPerson;
        if (p_name === undefined || p_name === null) {
            getPersonList(function (res) {
                p_name = res.person[0].person_name;
                chrome.storage.local.set({
                    "selectedPerson": p_name
                });
            });
        }
    });
}

/**
 * Check if the image url is in Data Uri Format
 * @param   {String}  img_url Url of image
 * @returns {boolean} 
 */
function isDataUri(img_url) {
    if (/^data:image/.test(img_url)) {
        // console.info(img_url+" -> DataURI");
        return true;
    }
    return false;
}