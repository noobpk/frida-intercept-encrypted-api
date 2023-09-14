/*************************************************************************************
 * Name: Intercept Encrypted API
 * OS: Android
 * Author: @noobpk
 * Source: https://github.com/noobpk/frida-intercept-encrypted-api
 **************************************************************************************/

'use strict';
var colors = {
    "resetColor": "\x1b[0m",
    "green": "\x1b[32m",
    "yellow": "\x1b[33m",
    "red": "\x1b[31m"
}

Java.perform(function () {
    /*Request Class & Method*/
    var request_class = Java.use('');
    var request_method = '';

    /*Response Class & Method*/
    var response_class = Java.use('');
    var response_method = '';

    request_class.request_method.overload('java.lang.String').implementation = function (request) {
        console.log(colors.green, "[Original Request Body]\n", colors.resetColor, JSON.stringify(request), '\n');
        send({ from: '/http', payload: JSON.stringify(js), api_path: 'request' })

        var rcv_data = "FAILURE";

        var op = recv('input', function (value) {
            console.log(colors.green, "Data type: " + typeof value.payload);
            if (typeof value.payload == 'object') {
                rcv_data = JSON.stringify(value.payload);
            } else {
                rcv_data = value.payload;
            }
        }).wait();
        
        if (rcv_data === "FAILURE") {
            var result = this.request_method(request);
        }
        else {
            var result = this.request_method(rcv_data);
        }
        return result;
    }

    response_class.response_method.overload('java.lang.String').implementation = function (response) {
        console.log(colors.green, "[Original Response Body]\n", colors.resetColor, JSON.stringify(response), '\n');
        send({ from: '/http', payload: JSON.stringify(js), api_path: 'response' })

        var rcv_data = "FAILURE";

        var op = recv('input', function (value) {
            console.log(colors.green, "Data type: " + typeof value.payload);
            if (typeof value.payload == 'object') {
                rcv_data = JSON.stringify(value.payload);
            } else {
                rcv_data = value.payload;
            }
        }).wait();

        if (rcv_data === "FAILURE") {
            var result = this.response_method(response);
        }
        else {
            var result = this.response_method(rcv_data);
        }
        return result;
    }
});