
var obj = JSON.parse(address)
if(obj.collection.rarities != []){
    $(".rarities ").append($(`<label class="text"> Rarities<label>`))
    $(".rarities").append($(`<div class="col"id="rarities">`))
    
    $(`#rarities`).append($(`<select class="form-select text select-param-token select-list" id ="select-rarities" name='rarities'>`))
    //var listRar = []
    
    for(var keyID in obj.collection.rarities){
        console.log("!")
        $(`#select-rarities`).append($(`<option class="text" value=${obj.collection.rarities[keyID].name}> ${obj.collection.rarities[keyID].name}</option>`))
        //listRar.push(obj.collection.rarities[keyID].name)
    }

    //$("#rarities ").append($(`<label>( ${listRar})<label>`))
    //$(`#rarities`).append($(`<input class="form-control" name="rarities">`)) 
}

if(obj.mediafiles != []){
    var nameMedia = []
    for(var name in obj.mediafiles){
        nameMedia.push(obj.mediafiles[name].name)//!
    }
}


if(obj.collection.parameters != []){
    $(".parameters ").append($(`<label class="text"> Parameters<label>`))
    for(var keyID in obj.collection.parameters){
        if ($.inArray(obj.collection.parameters[keyID].name, nameMedia) != -1 && obj.collection.parameters[keyID].type == "string" && obj.collection.parameters[keyID].minValue == null && obj.collection.parameters[keyID].maxValue == null){//! 
            $(".mediafile ").append($(`<label class="text"> MediaFile<label>`))
            $(".mediafile ").append($(`<div class="col"id="mediafile${keyID}">`))
            $(`#mediafile${keyID}`).append($(`<label class="form-label text"> ${obj.collection.parameters[keyID].name}<label>`))
            $(`#mediafile${keyID}`).append($(`<br><input type="file" class="form-file-input text" id="customFile" name=${obj.collection.parameters[keyID].name}>`))  
        } 
        if (obj.collection.parameters[keyID].type.substring(0,4) != "Enum" && $.inArray(obj.collection.parameters[keyID].name, nameMedia) == -1){//!
            $(".parameters").append($(`<div class="col"id="parameters${keyID}">`))
            $(`#parameters${keyID}`).append($(`<label class="form-label text"> ${obj.collection.parameters[keyID].name}<label>`))
            if (obj.collection.parameters[keyID].type == "uint"){
                $(`#parameters${keyID}`).append($(`<input type="number" required class="form-control text" name='${obj.collection.parameters[keyID].name}' min=${obj.collection.parameters[keyID].minValue} max=${obj.collection.parameters[keyID].maxValue}> `))
            }else{
                $(`#parameters${keyID}`).append($(`<input required class="form-control text" name='${obj.collection.parameters[keyID].name}' minlength=${obj.collection.parameters[keyID].minValue} maxlength=${obj.collection.parameters[keyID].maxValue}> `))
            }
            
        } 
       
        }
}

if (obj.enums.length > 0){
    $(".parameters").append($(`<br><label class="text">  Enum <label>`))

    //var listEnum = []
    for(var keyIdColEnum in obj.enums){
        $(".parameters").append($(`<div class="col" id="parametersE${keyIdColEnum}">`))
        $(`#parametersE${keyIdColEnum}`).append($(`<label class="form-label text"> ${obj.enums[keyIdColEnum].name}<label>`))
        $(`#parametersE${keyIdColEnum}`).append($(`<select class="form-select select-param-enum select-list text" id ="select-enum${keyIdColEnum}" name="${obj.enums[keyIdColEnum].name}">`))
        for(var keyIDenum in obj.enums[keyIdColEnum].enumVariants){
            //listEnum.push(obj.enums[keyIdColEnum].enumVariants[keyIDenum])
            $(`#select-enum${keyIdColEnum}`).append($(`<option class="text" value=${keyIDenum}> ${obj.enums[keyIdColEnum].enumVariants[keyIDenum]}</option>`))

        }
        //$(`#parametersE${keyIdColEnum}`).append($(`<label class="form-label"> (${listEnum})<label>`))
        //$(`#parametersE${keyIdColEnum}`).append($(`<input class="form-control" name="paramener[enum][${obj.enums[keyIdColEnum].name}]${keyIDenum}">`)) 
        //listEnum = []
    }
    }
// $("#sub-mint").on("click",(function(event){
//     event.preventDefault()
//     $("#form-param").submit()
//     $("#form-for-file").submit()
// }))
// $("#sub-mint").on("click",(function(event){
//     event.preventDefault()
//     var formData = new FormData($('#form-param').get(0));

//     $.ajax({
//      type: "POST",
//      url: $('#form-param').attr('action'),
//      //dataType: 'json',
//      data: formData,
//      success: function( response ) {
//        console.log( response );
//      }
//    });
//    $("#form-for-file").submit()
// }));
//
// for(var keyID in obj.mediafiles){
//     if(obj.mediafiles != []){
//         $(".mediafile ").append($(`<label> MediaFile<label>`))
//         $(".mediafile ").append($(`<div class="col"id="mediafile${keyID}">`))
//         $(`#mediafile${keyID}`).append($(`<label class="form-label"> ${obj.mediafiles[keyID].name}<label>`))
//         $(`#mediafile${keyID}`).append($(`<input class="form-control name="mediafile[${keyID}]">`))   
//         console.log(obj.mediafiles[keyID].name)
//     }
    
// }