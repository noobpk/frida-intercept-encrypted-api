/*************************************************************************************
 * Name: Intercept Encrypted API
 * OS: iOS
 * Author: @noobpk
 * Source: https://github.com/noobpk/frida-ios-intercept-api
 **************************************************************************************/

/*Terminal Color*/
var colors = {
    "resetColor": "\x1b[0m",
    "green": "\x1b[32m",
    "yellow": "\x1b[33m",
    "red": "\x1b[31m"
}

/*GLOBAL VARIABLE*/
var API_URL;
var API_PATH;
var HTTP_METHOD;

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

/**
 * The function `print_arguments` takes an array of arguments and prints information about each
 * argument, including its type, byte representation in hexadecimal, string representation, and binary
 * data representation.
 * @param args - The `args` parameter is an array of arguments passed to a function. In this case, it
 * seems to be an array of Objective-C objects.
 */
function print_arguments(args) {
    try {
        var n = 100;
        var last_arg = '';
        for (var i = 2; i < n; ++i) {
            var arg = (new ObjC.Object(args[i])).toString();
            if (arg == 'nil' || arg == last_arg) {
                break;
            }
            last_arg = arg;
            console.log('\t[+] Dump Arg' + i + ': ' + (new ObjC.Object(args[i])).toString());
            var data = new ObjC.Object(args[i]);
            console.log(colors.green, "\t\t[-] Arugment type: ", colors.resetColor);
            console.log("\t\t\t", data.$className);
            /* Converting Byte to HexString */
            console.log(colors.green, "\t\t[-] Bytes to Hex:", colors.resetColor);
            try {
                var arg = ObjC.Object(args[2]);
                var length = arg.length().valueOf();
                var bytes = arg.bytes();
                var byteString = "";
                for (var i = 0; i < length; i++) {
                    var byte = bytes.add(i).readU8();
                    byteString += byte.toString(16).padStart(2, '0'); // Convert to hex and pad with leading zero if needed
                }
                console.log("\t\t\t", byteString);
            } catch (err_bytes2hex) {
                console.log(colors.red, "\t\t\t[x] Cannot convert Byte to Hex. Error: ", err_bytes2hex, colors.resetColor);
            }
            /* Converting NSData to String */
            console.log(colors.green, "\t\t[-] NSData to String: ", colors.resetColor);
            try {
                var buf = data.bytes().readUtf8String(data.length());
                console.log("\t\t\t", buf);
            } catch (err_nsdata2string) {
                console.log(colors.red, "\t\t\t[x] Cannot convert NSData to String. Error: ", err_nsdata2string, colors.resetColor);
            }
            /* Converting NSData to Binary Data */
            console.log(colors.green, "\t\t[-] NSData to Binary Data: ", colors.resetColor);
            try {
                var buf = data.bytes().readByteArray(data.length());
                console.log(hexdump(buf, { ansi: true }));
            } catch (err_nsdata2bin) {
                console.log(colors.red, "\t\t\t[x] Cannot convert NSData to Binary Data. Error: ", err_nsdata2bin, colors.resetColor);
            }
        }
    } catch (err_dump) {
        console.log(colors.red, "\t\t\t[x] Cannot dump all arugment in method . Error: ", err_dump, colors.resetColor);
    }
}

if (ObjC.available)
{
    console.log(colors.green,"\n[*] Loading Script: \u2713",colors.resetColor);
    console.log(colors.green,"\n[*] Started: Hooking.... ",colors.resetColor);
    console.log(colors.green,"\n[*] Hooking API Url: ",colors.resetColor);
    var className = "NSURLSession"; 
    var funcName = "- dataTaskWithRequest:completionHandler:"; 
    console.log(className);
    console.log('   ' + funcName);

    var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');

    Interceptor.attach(hook.implementation, {  
        onEnter: function(args) 
            {
                HTTP_METHOD = ObjC.Object(args[2]).HTTPMethod();
                API_URL = ObjC.Object(args[2]).URL().absoluteString();
                var url = API_URL;
                var matches = /(https?:\/\/.*?)([/$].*)/.exec(url);
                //var domain = matches[1];
                API_PATH = matches[2];
            }
    });
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
                    /*DEBUG REQUEST HERE*/
                    // this._className = ObjC.Object(args[0]).toString();
                    // this._methodName = ObjC.selectorAsString(args[1]);
                    // console.log(colors.green,"-------------------------------------",colors.resetColor);
                    // console.log(colors.green,"[DEBUG-REQUEST] Detected call to: ",colors.resetColor);
                    // console.log('   ' + this._className + ' --> ' + this._methodName);
                    // console.log(colors.green,"[DEBUG-REQUEST] Dump Arugment in method: ",colors.resetColor);
                    // print_arguments(args);
                    /* Backtrace */
                    // console.log(colors.green, "[+] Backtrace: ", colors.resetColor);
                    // try {
                    //     console.log(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n\t"));
                    // } catch (err_backtrace) {
                    //     console.log(colors.red, "\t\t\t[x] Cannot backtrace . Error: ", err_backtrace, colors.resetColor);
                    // }
                    

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
                    console.log(colors.green,"[+] METHOD: ",colors.resetColor + HTTP_METHOD );
                    console.log(colors.green,"[+] URL: ",colors.resetColor + API_URL );
                    console.log(colors.green,"[+] API: ",colors.resetColor + API_PATH );
                    console.log(colors.green,"-------------------------------------",colors.resetColor);
                    console.log(colors.green,"[Original Request Body]\n",colors.resetColor, JSON.stringify(js), '\n');
                    if (typeof(API_PATH) === 'undefined') {
                        send({from: '/http', payload: JSON.stringify(js), api_path: 'request'})
                    }
                    else {
                        send({from: '/http', payload: JSON.stringify(js), api_path: API_PATH})
                    }
                    var op = recv('input', function(value) { // callback function
                        console.log(colors.green,"\n [Forwarding MITM Request Body]\n",colors.resetColor, value.payload);
                        var data = JSON.parse(value.payload);
                        console.log(colors.green,"\n [Data Structures]",colors.resetColor);
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
                    //
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
                    /*DEBUG RESPONSE HERE*/
                    // this._className = ObjC.Object(args[0]).toString();
                    // this._methodName = ObjC.selectorAsString(args[1]);
                    // console.log(colors.green,"-------------------------------------",colors.resetColor);
                    // console.log(colors.green,"[DEBUG-RESPONSE] Detected call to: ",colors.resetColor);
                    // console.log('   ' + this._className + ' --> ' + this._methodName);
                    // console.log(colors.green,"[DEBUG-RESPONSE] Dump Arugment in method: ",colors.resetColor);
                    // print_arguments(args);
                    /* Backtrace */
                    // console.log(colors.green, "[+] Backtrace: ", colors.resetColor);
                    // try {
                    //     console.log(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n\t"));
                    // } catch (err_backtrace) {
                    //     console.log(colors.red, "\t\t\t[x] Cannot backtrace . Error: ", err_backtrace, colors.resetColor);
                    // }
                    
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
                    if (typeof(API_PATH) === 'undefined') {
                        send({from: '/http', payload: JSON.stringify(js), api_path: 'response'})
                    } else {
                        send({from: '/http', payload: JSON.stringify(js), api_path: API_PATH})
                    }
                    var op = recv('input', function(value) { // callback function
                        console.log(colors.green,"\n [Forwarding MITM Response Body]\n",colors.resetColor, value.payload);
                        var data = JSON.parse(value.payload);
                        console.log(colors.green,"\n [Data Structures]",colors.resetColor);
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
                    //
                }
            });
        }
    }
    console.log(colors.green,"\n[*] Starting Intercepting\n",colors.resetColor);
}
else {
    console.log('Objective-C Runtime is not available!');
}