//TODO: image format unsupported (webp,svg) 
//resize image too big (The picture should be smaller than 3M with at least 16*16 pixels face area.)

var p_name;
var resizeRatio = 4;
var minWidth=50;
var minHeight=50;

chrome.storage.local.get("selectedPerson", function (returnData) {
    p_name = returnData.selectedPerson;
    //    console.info("Person to block:" + p_name);
    $(function () {
        trainPerson(p_name);
        //DATI PERSONA SELEZIONATA
        // getPersonInfo(p_name,function(res){
        // console.log(p_name+" - numero di facce:"+res.face.length);
        // });

        var imgs = $("img");
        //        console.info("img Start:" + imgs.length);
        for (var i = 0; i < imgs.length; i++) {
            checkFace(imgs[i]);
        }
        var observer_Src = new MutationSummary({
            callback: blockFace,
            queries: [{
                attribute: 'src'
            }]
        });
        var observer_Img = new MutationSummary({
            callback: blockFace,
            queries: [{
                element: 'img',
                elementAttributes: 'src'
            }]
        });
    });

}); //end CHROME STORAGE GET

function blockFace(summaries) {
    var added = summaries[0].added;

    for (var i = 0; i < added.length; i++) {
        checkFace(added[i]);
    }
    if (summaries[0].hasOwnProperty('valueChanged')) {
        var valueChanged = summaries[0].valueChanged;
        // console.log("VC:"+valueChanged.length);
        for (var i = 0; i < valueChanged.length; i++) {
            checkFace(valueChanged[i]);
        }
    }
}

function checkFace(element) {
    var currentImg = element;
    if (element instanceof jQuery === false)
        var currentImg = $(element);

    var img_url = currentImg.attr("src");
    // if(img_url==undefined){
    // console.info(currentImg);
    // }
    //Get src of bigger image in srcset
    if (currentImg[0].hasAttribute("srcset")) {
        var srcsetType = currentImg.attr("srcset").split(",");
        var biggerImg = srcsetType[srcsetType.length - 1]; //last src in set
        biggerImg = biggerImg.split(" ");
        img_url = biggerImg[1];
    }

    //HACK FOR LAZY LOADER
    if (currentImg[0].hasAttribute("data-original")) {
        img_url = currentImg.attr("data-original");
    }

    img_url = relativeToAbsoluteUrl(img_url);
    //TODO converti dataURI To blob
    if (isDataUri(img_url) === false) {
        var img = new Image();
        img.src = img_url;
        img.onload = function () {
            imgHeight = img.naturalHeight;
            imgWidth = img.naturalWidth;
            if (imgWidth <= minWidth || imgHeight <= minHeight) {
                currentImg.addClass("ignored-for-dimension");
            } 
            //            else if (imgWidth > 4000 || imgHeight > 4000) {
            //                console.log("resize");
            //                tooLargeImageCheck(img_url,currentImg);
            //            }
            else {
                detectFromUrlSync(img_url).then(function (result) {
                    successCallback(result,currentImg);
                }, function (reason) {
                    errorCallback(reason,currentImg,img_url);
                }); //END DETECT
            }
        }
    }
    else{
        console.error("DATA URI");
    }
};

function obscure(img) {
    //Maintain its previous size
    var width = img.width();
    var height = img.height();
    img.css("width", width);
    img.css("height", height);

    img.attr("alt", "Obscured by FaceBlocker")
    img.attr("src", "");
    img.attr("srcset", "");
    img.addClass("obscured");
}


function successCallback(result,currentImg){
    //Array of Face_ID detected
    var face_ids = [];
    for (var index = 0; index < result.face.length; index++)
        face_ids.push(result.face[index].face_id);

    if (face_ids.length > 1) {
        currentImg.addClass("double-face-detect");
        //console.log(face_ids);
    }
    if (face_ids.length == 0) {
        currentImg.addClass("no-face-detect");
        // console.info("noFaceDetected->url: "+img_url);
    }

    for (var i = 0; i < face_ids.length; i++) {
        verify(p_name, face_ids[i], function (res) {
            if (res.is_same_person == true) {
                obscure(currentImg);
            } else {
                //console.info("notObscured->url: "+img_url);
                currentImg.addClass("not-obscured");
            }
        }); //END VERIFY
    }
}

function errorCallback(reason,currentImg,img_url){
    currentImg.addClass("error");
    console.error("FAIL:" + reason);

    if (reason == "1303") {//TOO LARGE IMAGE ERROR
        console.info(img_url+" is too big -> resize and retry");
        tooLargeImageCheck(img_url,currentImg);
    }
}

function isDataUri(img_url) {
    if (/^data:image/.test(img_url)) {
        // console.info(img_url+" -> DataURI");
        return true;
    }
    return false;
}


function tooLargeImageCheck(img_url,currentImg) {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");
    imgToResize = new Image();
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
                    //                    console.log(blob);
                    detectFromFileSync(blob).then(function (result) {
                        successCallback(result,currentImg);
                    }, function (reason) {
                        errorCallback(reason,currentImg,img_url);
                    }); //END DETECT
                },
                'image/jpeg'
            );
        }

    }
    imgToResize.src = img_url;
}



// If url is relative, convert to absolute.
function relativeToAbsoluteUrl(url) {
    if (!url)
        return url;

    // If URL is already absolute
    if (/^[a-zA-Z\-]+\:/.test(url))
        return url;

    if (url[0] == '/') {
        // Leading // means only the protocol is missing
        if (url[1] && url[1] == "/")
            return document.location.protocol + url;

        // Leading / means absolute path
        return document.location.protocol + "//" + document.location.host + url;
    }

    // Remove filename and add relative URL to it
    var base = document.baseURI.match(/.+\//);
    if (!base)
        return document.baseURI + "/" + url;
    return base[0] + url;
}
