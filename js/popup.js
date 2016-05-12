$(function(){
    var selectionFrom=$("#selection");
    var confirmSelectionBtn=$("#confirm");
    var currentPersonElem=$("#current_person");

    showCurrentPerson();

    $("#get_person").on("click",function(){
        clearPersonList();
        getPersonList(function(result){
            var p_list=result.person;
            confirmSelectionBtn.removeClass("hide");
            for(var i=0;i<p_list.length;i++){
                appendRadioButton(p_list[i].person_name);
            }
        },function(err){
            selectionFrom.append("<h3 class='ui message error'>Error!</h3>");
        });
    });


    confirmSelectionBtn.on("click",function(){
        var selectedPerson=$('input[type=radio]:checked').val(); 
        chrome.storage.local.set({"selectedPerson":selectedPerson},function() {
            // chrome.storage.local.get("selectedPerson", function(returnData) {
            // console.log("Settings saved ->" + returnData.selectedPerson);
            // });
            showCurrentPerson();
        });
    });

    $("#editor").on("click",function(){
        chrome.tabs.create({'url': chrome.extension.getURL("../editor.html"), 
                            'active': true});
    });

    //UTILITY FUNC

    function showCurrentPerson(){
        chrome.storage.local.get("selectedPerson", function(returnData) {
            currentPersonElem.text(returnData.selectedPerson);
        });
    };
    function clearPersonList(){
        selectionFrom.children().remove();
    }
    function appendRadioButton(text){
        selectionFrom.append("<input type='radio' name='p_name' class='ui radio checkbox' value="+text+" id='"+text+"'><label for='"+text+"'>"+text+"</label><br>")
    };

});


