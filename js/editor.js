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


$(function () {
    var selectedPerson = null;

    var create_input = $("#create-input");
    var personList = $("#person-list");
    var createBtn = $("#create");
    var deleteBtn = $("#delete");
    var personListBtn = $("#getPersonList");
    var face_storedBtn = $("#face-stored");
    var faceNumber = $("#face-number");
    var uploadBtn = $("#upload_button");
    var addFaceBtn = $("#add");
    var fileNumber = $("#file_number");
    var errorListMessage = $("#error_list_message");
    var errorList = $("#error_list");

    var fileInput = document.getElementById('file');

    createBtn.on("click", function () {
        if (create_input.val() != "") {
            createPerson(create_input.val(), function () {
                notify("Person created", "success");
                personListBtn.click();
            }, function (err) {
                notify("Impossible to create person: " + create_input.val() + " - " + errorCodeList[err], "error");
            });
        } else {
            notify("Empty input", "warning");
        }
    });

    personListBtn.on("click", function () {
        $(".my-loader").removeClass("hide");
        hideButton();
        getPersonList(function (result) {
            clearList();
            var p_list = result.person;
            for (var i = 0; i < p_list.length; i++) {
                var person = p_list[i].person_name;
                personList.append("<input type='radio' class='ui radio checkbox' name=p_name value=" + person + " id='" + person + "'><label for='" + p_list[i].person_name + "'>" + p_list[i].person_name + "</label><br>");
                $("input:radio").change(function () {
                    faceNumber.text("");
                    showButton();
                    selectedPerson = $('input[type=radio]:checked').val();
                });
            }
        }, function (err) {
            personList.append("<h3 class='ui message error'>Error: - " + errorCodeList[err] + "</h3>");
        });
        $(".my-loader").addClass("hide");
    });

    $("#file").change(function () {
        addFaceBtn.removeClass("hide");
        fileNumber.removeClass("hide");
        fileNumber.text("File upload:" + fileInput.files.length);
    });

    addFaceBtn.on("click", function () {
        DetectAndAdd(fileInput.files);
        $(".my-loader").removeClass("hide");
        if (errorListMessage.hasClass("hide") == false)
            errorList.append("<hr>");
    });


    deleteBtn.on("click", function () {
        $('.small.modal').modal("setting", {
            onApprove: function () {
                //                var selectedPerson = $('input[type=radio]:checked').val();
                deletePerson(selectedPerson, function () {
                    notify("Person deleted", "success");
                    personListBtn.click();
                }, function () {
                    notify("Impossible to delete person: " + selectedPerson + " - " + errorCodeList[err], "error");
                });
            }
        }).modal('show');
    });

    face_storedBtn.on("click", function () {
        //        var selectedPerson = $('input[type=radio]:checked').val();
        getPersonInfo(selectedPerson, function (res) {
            faceNumber.text("Face stored:" + res.face.length);
        });
    });


    //_______________________________________________________________________

    function clearList() {
        personList.children().remove();
    };


    /**
     * Create a notify with noty.js
     * @param {String} text Message to show in notify
     * @param {Strung} type error , success, warning or infomation
     */
    function notify(text, type) {
        if (type != "error" && type != "success" && type != "warning" && type != "information") {
            console.error("notify type not exist");
        } else {
            var txt = "<h5>" + text + "</h5>"
            noty({
                layout: 'bottomRight',
                text: txt,
                type: type,
                timeout: 5000
            });
        }
    }

    function hideButton() {
        deleteBtn.addClass("hide");
        face_storedBtn.addClass("hide");
        uploadBtn.addClass("hide");
        faceNumber.text("");
        addFaceBtn.addClass("hide");
        fileNumber.addClass("hide");
        errorListMessage.addClass("hide");
    }

    function showButton() {
        deleteBtn.removeClass("hide");
        face_storedBtn.removeClass("hide");
        uploadBtn.removeClass("hide");
    }

    var allPromise = [];
    var face_ids = [];
    var resizeRatio = 4;
    var maxFileSize=3; //MB
    var bigImagePresent=false;

    function DetectAndAdd(files) {
        allPromise = [];
        face_ids = [];
        bigImagePresent=false;
        if (selectedPerson != null && selectedPerson != undefined) {
            for (var i = 0; i < files.length; i++)
                detectAndShowErrorSync(files[i]);
        } else
            console.log("no person selected");
        Q.allSettled(allPromise).spread(function () {
            var face_string = "";
            for (var i = 0; i < face_ids.length; i++) {
                face_string = face_string + face_ids[i];
                if (i != face_ids.length - 1)
                    face_string = face_string + ",";
            }
            if (face_string != "")
                addFace(face_string, selectedPerson, function (result) {
                    notify("Operation Complete - Faces Added: " + result.added, "information");
                    resetUploadForm();
                }, function (err) {
                    notify("Add Error: " + errorCodeList[err], "error");
                });
            else {
                notify("Operation Complete - Faces Added: 0 <br> (Wait For Too Big Image)", "warning");
            }
            console.log(bigImagePresent);
            if(bigImagePresent==false)
                $(".my-loader").addClass("hide");
            console.log(allPromise.length + " - face_ids size: " + face_ids.length);
        });
    }

    function detectAndShowErrorSync(file) {
        var file_size = (file.size / 1024) / 1024; //size in MB del file
        if (file_size < maxFileSize) {
            var detectPromise = detectFromFileSync(file)
            .then(
                function (result) {
                    if (result.face.length != 1) {
                        showErrorMessage();
                        errorList.append("<li><b>" + file.name + "</b> >>> The image must contain one face.</li>");
                    } else {
                        var face_id = result.face[0].face_id;
                        face_ids.push(face_id);
                    }
                },
                function (err) {
                    showErrorMessage();
                    errorList.append("<li><b>" + file.name + "</b> >>> Error Detect: " + errorCodeList[err] + ".</li>");
                });
            allPromise.push(detectPromise);
        } else {
            //resize image to big
            notify(file.name + " is too big. We try to resize and add to person.", "warning");
            bigImagePresent=true;
            addTooBigImage(file);
        }
    }

    //FIXME
    function addTooBigImage(current_file) {
        var file=current_file
        var canvas = document.createElement("canvas");
        var canvasContext = canvas.getContext("2d");
        var imgToResize = new Image();
        imgToResize.onload = function () {
            var w = imgToResize.width;
            var h = imgToResize.height;
            canvas.width = w / resizeRatio;
            canvas.height = h / resizeRatio;
            canvasContext.drawImage(imgToResize, 0, 0, w / resizeRatio, h / resizeRatio);

            if (canvas.toBlob) {
                canvas.toBlob(
                    function (blob) {
                        detectFromFileSync(blob)
                            .then(function (result) {
                            if (result.face.length != 1) {
                                showErrorMessage();
                                errorList.append("<li><b>" + file.name + "</b> >>> The image must contain only one face.</li>");
                            } else {
                                var face_id = result.face[0].face_id;
                                addFace(face_id, selectedPerson, function (result) {
                                    notify(file.name+" : image resize and added.","information");
                                    //                                    console.log(file.name+"-"+face_id);
                                    
                                });
                            }
                            $(".my-loader").addClass("hide");
                        }, function (err) {
                            chrome.notifications.create(createNotificationOption("Error", errorCodeList[err]));
                            $(".my-loader").addClass("hide");
                        }); //END DETECT

                    },
                    'image/jpeg'
                );
            }
            URL.revokeObjectURL(imgToResize.src);
        }
        imgToResize.src = URL.createObjectURL(file);;
    }


    function showErrorMessage() {
        if (errorListMessage.hasClass("hide"))
            errorListMessage.removeClass("hide");
    }

    function resetUploadForm() {
        $("#file").val('');
        $(".my-loader").addClass("hide");
        addFaceBtn.addClass("hide");
        fileNumber.addClass("hide");
        fileNumber.text("");
    }

    //Enable closing message
    $('.message .close')
        .on('click', function () {
        $(this)
            .closest('.message')
            .addClass("hide");
        errorList.children().remove();
    });

});