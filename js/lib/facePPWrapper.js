//TODO function doc

//var api = new FacePP('0ef14fa726ce34d820c5a44e57fef470', '4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD'); //EXAMPLE KEY

var api = new FacePP('c6a7023e6aa59320fb5276f0a9e3816e', 'ppnYzIQQjz_BNnCh6AfOI3NqfshoTV9i');       

function settingAPIKey(APIKey,APISecret){
    api = new FacePP(APIKey,APISecret);
}


function createPerson(person_name,successCallback,errorCallback){
    api.request('/person/create',{
        person_name:person_name
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}

function deletePerson(person_name,successCallback,errorCallback){
    api.request('/person/delete',{
        person_name:person_name
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}

function getPersonInfo(p_name,successCallback,errorCallback){
    api.request('/person/get_info',{
        person_name:p_name
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}

function trainPerson(person_name,successCallback,errorCallback){
    api.request('/train/verify',{
        person_name: person_name
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}


function detectFromFile(file,successCallback,errorCallback){
    api.request('/detection/detect',{
        img:file
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}

function detectFromUrl(url_face,successCallback,errorCallback){
    api.request('/detection/detect',{
        url:url_face
    },function(err,result){
       if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}


function addFace(face_id,person_name,successCallback,errorCallback){
    api.request('/person/add_face',{
        person_name:person_name,
        face_id:face_id
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });

}

function removeFace(face_id,person_name,successCallback,errorCallback){
    api.request('/person/remove_face',{
        person_name:person_name,
        face_id:face_id
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });

}

function compare(faceID_1,faceID_2,successCallback,errorCallback){
    api.request('/recognition/compare',{
        face_id1:faceID_1,
        face_id2:faceID_2
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}


function verify(person_name,face_id,successCallback,errorCallback){
    api.request('/recognition/verify', {
        face_id: face_id,
        person_name: person_name
    },function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });

}

function getPersonList(successCallback,errorCallback){
    api.request('/info/get_person_list',{},function(err,result){
        if(err){
            if(errorCallback && typeof(errorCallback) === "function"){
                errorCallback(err);
            }
        }
        else{
            if(successCallback && typeof(successCallback) === "function"){
                successCallback(result);
            }
        }
    });
}

//______________________________________SYNC FUNCTION WITH PROMISE Q.js


function createPersonSync(person_name){
    var deferred=Q.defer();
    api.request('/person/create',{
        person_name:person_name
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function deletePersonSync(person_name)
{
    var deferred=Q.defer();
    api.request('/person/delete',{
        person_name:person_name
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    return deferred.promise;
}

function getPersonInfoSync(p_name)
{
    var deferred=Q.defer();
    api.request('/person/get_info',{
        person_name:p_name
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function detectFromUrlSync(url_face){
    var deferred=Q.defer();

    api.request('/detection/detect',{
        url:url_face
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function detectFromFileSync(file){
    var deferred=Q.defer();
    api.request('/detection/detect',{
        img:file
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}


function addFaceSync(face_id,person_name){
    var deferred=Q.defer();
    api.request('/person/add_face',{
        person_name:person_name,
        face_id:face_id
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    }); 
    return deferred.promise;
}

function removeFaceSync(face_id,person_name){
    var deferred=Q.defer();
    api.request('/person/remove_face',{
        person_name:person_name,
        face_id:face_id
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function trainPersonSync(p_name){
    var deferred=Q.defer();
    api.request('/train/verify',{
        person_name: person_name
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function getPersonListSync(){
    var deferred=Q.defer();
    api.request('/info/get_person_list',{},function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}


function verifySync(person_name,face_id){
    var deferred=Q.defer();
    api.request('/recognition/verify', {
        face_id: face_id,
        person_name: person_name
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

function compareSync(faceID_1,faceID_2){
    var deferred=Q.defer();
    api.request('/recognition/compare',{
        face_id1:faceID_1,
        face_id2:faceID_2
    },function(err,result){
        if(err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });
    return deferred.promise;
}

