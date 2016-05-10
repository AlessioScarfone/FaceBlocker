$(function () {
    var create_input = $("#create-input");
    var personList = $("#person-list");
    var createBtn = $("#create");
    var deleteBtn = $("#delete");
    var personListBtn = $("#getPersonList");
    var face_storedBtn = $("#face-stored");
    var faceNumber = $("#face-number");

    createBtn.on("click", function () {
        if (create_input.val() != "") {
            createPerson(create_input.val(), function () {
                notify("Person created", "success");
                personListBtn.click();
            }, function () {
                notify("Impossible to create person: " + create_input.val(), "error");
            });
        } else {
            notify("Empty input", "warning");
        }
    });

    personListBtn.on("click", function () {
        hideButton();
        getPersonList(function (result) {
            clearList();
            var p_list = result.person;
            for (var i = 0; i < p_list.length; i++) {
                personList.append("<li><input type='radio' name=p_name value=" + p_list[i].person_name + ">" + p_list[i].person_name + "</input></li>");
                $("input:radio").change(function () {
                    faceNumber.text("");
                    showButton();
                });
            }
        }, function (err) {
            personList.text("error!");
        });
    });

    deleteBtn.on("click", function () {
        $('.small.modal').modal("setting", {
            onApprove: function () {
                var selectedPerson = $('input[type=radio]:checked').val();
                deletePerson(selectedPerson, function () {
                    notify("Person deleted", "success");
                    personListBtn.click();
                }, function () {
                    notify("Impossible to delete person: " + selectedPerson, "error");
                });
            }
        }).modal('show');
    });
    
    face_storedBtn.on("click", function () {
        var selectedPerson = $('input[type=radio]:checked').val();
        getPersonInfo(selectedPerson, function (res) {
            console.log(res.face.length);
            faceNumber.text("Face stored:" + res.face.length);
        });
    });

    function clearList() {
        personList.children().remove();
    };


    function notify(text, type) {
        if (type != "error" && type != "success" && type != "warning" && type != "information") {
            console.error("notify type not exist");
        } else {
            var txt = "<h5>" + text + "</h5>"
            noty({
                layout: 'bottomRight',
                text: txt,
                type: type
            });
        }
    }

    function hideButton() {
        deleteBtn.addClass("hide");
        face_storedBtn.addClass("hide");
        faceNumber.text("");
    }

    function showButton() {
        deleteBtn.removeClass("hide");
        face_storedBtn.removeClass("hide");
    }


});