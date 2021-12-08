# Frida iOS intercept api 
<img width="621" alt="image" src="https://user-images.githubusercontent.com/31820707/129575322-c601d548-1a48-4bcb-a23f-fefa751b93c1.png">

[![CodeQL](https://github.com/noobpk/frida-ios-intercept-api/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/noobpk/frida-ios-intercept-api/actions/workflows/codeql-analysis.yml)
![python](https://img.shields.io/badge/python-3.x-blue)
![frida](https://img.shields.io/badge/frida-15.x-orange)
## What does it help?
Banking applications are increasingly enhanced with confidentiality. One of them is the encryption of request / response data when sending and receiving. Some weak encryptions can be decrypted easily, but some strong encryptions like RSA are difficult. Hooking into functions that send request/response and intercept data before it's encrypted is one way we can view and modify the data.

# Configurage handlers.js
1. Add your Request / Response Class & Method
```
/*Request Class & Method*/
var search_request_class  = [''];
var search_request_method = [''];

/*Response Class & Method*/
var search_response_class  = [''];
var search_response_method = [''];`
```
2. Debug ARGS in method
```
/*DEBUG ARGS*/
//print_arguments(args);
// console.log(ObjC.Object(args[3]));
// var message1 = ObjC.Object(args[2]);
// var message2 = ObjC.Object(args[3]);
// var message3 = ObjC.Object(args[4]);

// console.log('msg1=' + message1.toString() + ",type: "+ message1.$className);
// console.log('msg2=' + message2.toString() + ",type: "+ message2.$className);
// console.log('msg3=' + message3.toString() + ",type: "+ message3.$className);
```

## Usage
 1. Set up Burp listener
     - Listen on 127.0.0.1:26080
     - Redirect to 127.0.0.1:27080 and Check (Support invisible proxying)
 1. Run echoServer.py
 1. Config and optimize handlers.js
 1. Run burpTracer.py -p com.apple.AppStore / [-n 'App Store']

*Note: Different applications will use different libraries. You need to reverse or trace the application to find the correct function.

## Medium
https://medium.com/p/a5c4ef22a093

## Working with
|Application|Demo|
|-----------|----|
|OceanBank|https://youtu.be/hn1GV-JCpjc|
|SaiGonBank Smart Banking|https://youtu.be/7C0SLvtI7RY|
|BaoViet Smart||
