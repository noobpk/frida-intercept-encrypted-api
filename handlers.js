/*Terminal Color*/
var colors = {
    "resetColor": "\x1b[0m",
    "green": "\x1b[32m",
    "yellow": "\x1b[33m",
    "red": "\x1b[31m"
}

/*Request Class & Method*/
var search_request_class  = [''];
var search_request_method = [''];

/*Response Class & Method*/
var search_response_class  = [''];
var search_response_method = [''];

/*Function Search Request Method*/
function search_request_methods(className) {
    var request_methods_found = [];
    var methods = ObjC.classes[className].$ownMethods;
    if (Array.isArray(search_request_method) && search_request_method.length) { //search_request_method not empty
        for (var j = 0; j < search_request_method.length; j++) {
            if (methods.join(' ').toLowerCase().includes(search_request_method[j].toLowerCase())) {
                for (var i = 0; i < methods.length; i++){
                    if (methods[i].toLowerCase().includes(search_request_method[j].toLowerCase())) {
                        request_methods_found.push(methods[i]);
                    }
                }
            }
        }
    }
    else {
        var methods = ObjC.classes[className].$ownMethods;
        for (var i = 0; i < methods.length; i++){
            request_methods_found.push(methods[i]);
        }
    }
    return request_methods_found;
}

/*Function Search Request Class*/
function search_request_classes(){
    var classes_request_found = [];
    for (var className in ObjC.classes) {
        if (Array.isArray(search_request_class) && search_request_class.length) {
            for (var i = 0; i < search_request_class.length; i++) {
                if (className.toLowerCase().includes(search_request_class[i].toLowerCase())) {
                    classes_request_found.push(className);
                }
            }
        }
    }
    return classes_request_found;
}

/*Function Search Response Method*/
function search_response_methods(className) {
    var response_methods_found = [];
    var methods = ObjC.classes[className].$ownMethods;
    if (Array.isArray(search_response_method) && search_response_method.length) { //search_response_method not empty
        for (var j = 0; j < search_response_method.length; j++) {
            if (methods.join(' ').toLowerCase().includes(search_response_method[j].toLowerCase())) {
                for (var i = 0; i < methods.length; i++){
                    if (methods[i].toLowerCase().includes(search_response_method[j].toLowerCase())) {
                        response_methods_found.push(methods[i]);
                    }
                }
            }
        }
    }
    else {
        var methods = ObjC.classes[className].$ownMethods;
        for (var i = 0; i < methods.length; i++){
            response_methods_found.push(methods[i]);
        }
    }
    return response_methods_found;
}

/*Function Search Response Class*/
function search_response_classes(){
    var classes_response_found = [];
    for (var className in ObjC.classes) {
        if (Array.isArray(search_response_class) && search_response_class.length) {
            for (var i = 0; i < search_response_class.length; i++) {
                if (className.toLowerCase().includes(search_response_class[i].toLowerCase())) {
                    classes_response_found.push(className);
                }
            }
        }
    }
    return classes_response_found;
}

function print_arguments(args) {
/*
Frida's Interceptor has no information about the number of arguments, because there is no such 
information available at the ABI level (and we don't rely on debug symbols).

I have implemented this function in order to try to determine how many arguments a method is using.
It stops when:
    - The object is not nil
    - The argument is not the same as the one before    
 */
    var n = 100;
    var last_arg = '';
    for (var i = 2; i < n; ++i) {
        var arg = (new ObjC.Object(args[i])).toString();
        if (arg == 'nil' || arg == last_arg) {
            break;
        }
        last_arg = arg;
        console.log('\t[-] arg' + i + ': ' + (new ObjC.Object(args[i])).toString());
    }
}

if (ObjC.available)
{
    console.log(colors.green,"\n[*] Loading Script: handlers.js version@1.2",colors.resetColor);
    console.log(colors.green,"\n[*] Started: Hooking.... ",colors.resetColor);
    console.log(colors.green,"\n[*] Hooking Request: ",colors.resetColor);
    var classes_request_found = search_request_classes();
    for (var i = 0; i < classes_request_found.length; ++i) {
        var methods_request_found = 0;
        methods_request_found = search_request_methods(classes_request_found[i]);

        if (Object.keys(methods_request_found).length){
            console.log(classes_request_found[i]);
        }
        for (var j = 0; j < methods_request_found.length; ++j) {
            var _className = "" + classes_request_found[i];
            var _methodName = "" + methods_request_found[j];
            var hooking = ObjC.classes[_className][_methodName];
            console.log('   ' + methods_request_found[j]);

            Interceptor.attach(hooking.implementation, {
                onEnter: function (args, state) {
                    /*DEBUG REQUEST ZONE*/
                    this._className = ObjC.Object(args[0]).toString();
                    this._methodName = ObjC.selectorAsString(args[1]);
                    console.log(colors.green,"-------------------------------------",colors.resetColor);
                    console.log(colors.green,"[DEBUG-REQUEST] Detected call to: ",colors.resetColor);
                    console.log('   ' + this._className + ' --> ' + this._methodName);
                    // console.log(colors.green,"[DEBUG-REQUEST] Dump Arugment in method: ",colors.resetColor);
                    // print_arguments(args);
                    // console.log(ObjC.Object(args[3]));
                    // var message1 = ObjC.Object(args[2]);
                    // var message2 = ObjC.Object(args[3]);
                    // var message3 = ObjC.Object(args[4]);

                    // console.log('msg1=' + message1.toString() + ",type: "+ message1.$className);
                    // console.log('msg2=' + message2.toString() + ",type: "+ message2.$className);
                    // console.log('msg3=' + message3.toString() + ",type: "+ message3.$className);
                    

                    this.buf = ObjC.Object(args[3]).toString();

                    var js = {};
                    var dict = new ObjC.Object(args[3]);
                    var enumerator = dict.keyEnumerator();
                    var key;
                    while((key = enumerator.nextObject()) !== null){
                        var value = dict.objectForKey_(key);
                        js[key] = value.toString();
                    }

                    console.log(colors.green,"-------------------------------------",colors.resetColor);
                    console.log(colors.green,"[Original Request Body]\n",colors.resetColor, JSON.stringify(js), '\n');
                    send({from: '/http', payload: JSON.stringify(js)})
                    var op = recv('input', function(value) { // callback function
                        console.log(colors.green,"\n [Forwarding MITM Request Body]\n",colors.resetColor, value.payload);
                        var data = JSON.parse(value.payload);
                        console.log(colors.green,"\n [Data Structure]",colors.resetColor);
                        console.log(colors.green,"\n  [+] Data Type:",colors.resetColor, data);
                        var dataDict = ObjC.classes.NSMutableDictionary.alloc().init();
                        var NSString = ObjC.classes.NSString; 
                        console.log(colors.green,"\n  [+] Parser Key -> Value:",colors.resetColor);   
                        for(var key in data){
                            if(data.hasOwnProperty(key)){
                                console.log('  ', key + " -> " + data[key]);
                                var valueObject = NSString.stringWithString_(data[key]); 
                                dataDict.setObject_forKey_(valueObject, key);
                            }
                        }
                        console.log(colors.green,"\n  [+] Data Dict:\n",colors.resetColor, dataDict);
                        args[3] = dataDict;
                    });
                    op.wait();
                },
                onLeave: function(retval, state) {
                    
                }
            });
        }
    }
    console.log(colors.green,"\n[*] Hooking Response: ",colors.resetColor);
    var classes_response_found = search_response_classes();
    for (var i = 0; i < classes_response_found.length; ++i) {
        var methods_response_found = 0;
        methods_response_found = search_response_methods(classes_response_found[i]);

        if (Object.keys(methods_response_found).length){
            console.log(classes_response_found[i]);
        }
        for (var j = 0; j < methods_response_found.length; ++j) {
            var _className = "" + classes_response_found[i];
            var _methodName = "" + methods_response_found[j];
            var hooking = ObjC.classes[_className][_methodName];
            console.log('   ' + methods_response_found[j]);

            Interceptor.attach(hooking.implementation, {
                onEnter: function (args, state) {
                    /*DEBUG RESPONSE ZONE*/
                    this._className = ObjC.Object(args[0]).toString();
                    this._methodName = ObjC.selectorAsString(args[1]);
                    console.log(colors.green,"-------------------------------------",colors.resetColor);
                    console.log(colors.green,"[DEBUG-RESPONSE] Detected call to: ",colors.resetColor);
                    console.log('   ' + this._className + ' --> ' + this._methodName);
                    // console.log(colors.green,"[DEBUG-RESPONSE] Dump Arugment in method: ",colors.resetColor);
                    // print_arguments(args);
                    // console.log(ObjC.Object(args[2]));
                    // var message1 = ObjC.Object(args[2]);
                    // var message2 = ObjC.Object(args[3]);
                    // var message3 = ObjC.Object(args[4]);

                    // console.log('msg1=' + message1.toString() + ",type: "+ message1.$className);
                    // console.log('msg2=' + message2.toString() + ",type: "+ message2.$className);
                    // console.log('msg3=' + message3.toString() + ",type: "+ message3.$className);
                    

                    this.buf = ObjC.Object(args[2]).toString();

                    var js = {};
                    var dict = new ObjC.Object(args[2]);
                    var enumerator = dict.keyEnumerator();
                    var key;
                    while((key = enumerator.nextObject()) !== null){
                        var value = dict.objectForKey_(key);
                        js[key] = value.toString();
                    }

                    console.log(colors.green,"-------------------------------------",colors.resetColor);
                    console.log(colors.green,"[Original Response Body]\n",colors.resetColor, JSON.stringify(js), '\n');
                    send({from: '/http', payload: JSON.stringify(js)})
                    var op = recv('input', function(value) { // callback function
                        console.log(colors.green,"\n [Forwarding MITM Response Body]\n",colors.resetColor, value.payload);
                        var data = JSON.parse(value.payload);
                        console.log(colors.green,"\n [Data Structure]",colors.resetColor);
                        console.log(colors.green,"\n  [+] Data Type:",colors.resetColor, data);
                        var dataDict = ObjC.classes.NSMutableDictionary.alloc().init();
                        var NSString = ObjC.classes.NSString;
                        console.log(colors.green,"\n  [+] Parser Key -> Value:",colors.resetColor);    
                        for(var key in data){
                            if(data.hasOwnProperty(key)){
                                console.log('  ', key + " -> " + data[key]);
                                var valueObject = NSString.stringWithString_(data[key]); 
                                dataDict.setObject_forKey_(valueObject, key);
                            }
                        }
                        console.log(colors.green,"\n  [+] Data Dict:\n",colors.resetColor, dataDict);
                        args[2] = dataDict;
                    });
                    op.wait();
                },
                onLeave: function(retval, state) {
                    
                }
            });
        }
    }
    console.log(colors.green,"\n[*] Starting Intercepting\n",colors.resetColor);
}
else {
    console.log('Objective-C Runtime is not available!');
}