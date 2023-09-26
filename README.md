# Frida Intercept Encrypted Api 

<img width="512" alt="image" src="https://github.com/noobpk/frida-intercept-encrypted-api/assets/31820707/313889af-1111-49f1-bcfb-76e61b5f8a0c">

[![CodeQL](https://github.com/noobpk/frida-ios-intercept-api/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/noobpk/frida-ios-intercept-api/actions/workflows/codeql-analysis.yml)
![python](https://img.shields.io/badge/python-3.x-blue)
![frida](https://img.shields.io/badge/frida-15.x-orange)
![ios](https://img.shields.io/badge/ios-orange)
![android](https://img.shields.io/badge/android-green)


## 📍What does it help?
Banking applications, e-wallets, .. are increasingly enhanced security to fight hackers. One of them is to encrypt request/response data when sending and receiving. Some weak encryptions can be decrypted easily, but some strong encryptions like RSA are difficult.
When pentesting a normal mobile application, we just need to set it up so that BurpSuite can intercept the request / response of the APIs that the application uses. But when pentesting a banking or e-wallet application with end-to-end encrypted API, with the usual BurpSuite setup we cannot see the content of the API.
Hooking into functions that send request/response and intercept data before it is encrypted is one way we can view and modify data.

## Architecture

<img width="1440" alt="image" src="https://user-images.githubusercontent.com/31820707/156509245-163d4877-3bcd-423f-adbe-0edc9e1bf43a.png">

## For IOS

### Configurage ios_handlers.js

1. Add your Request / Response Class & Method
```
/*Request Class & Method*/
var search_request_class  = [''];
var search_request_method = [''];

/*Response Class & Method*/
var search_response_class  = [''];
var search_response_method = [''];`
```
2. Debug ARGS in Class & Method
```
/*DEBUG REQUEST HERE*/
console.log(colors.green,"[DEBUG-REQUEST] Dump Arugment in method: ",colors.resetColor);
print_arguments(args);
```

## For Android

### Configurage android_handlers.js

1. Add your Request / Response Class & Method
```
/*Request Class & Method*/
    var request_class = Java.use('');
    var request_method = '';

    /*Response Class & Method*/
    var response_class = Java.use('');
    var response_method = '';
```

## Usage
 1. Load `burpsuite_configuration_proxy.json` or Set up Burpsuite Proxy by following the steps below
     - Listen on 127.0.0.1:26080
     - Redirect to 127.0.0.1:27080 and Check (Support invisible proxying)
 1. Run echoServer.py
 1. Config and optimize `_handlers.js`
 1. Run burpTracer.py -p com.apple.AppStore / [-n 'App Store']

`Note: Different applications will use different libraries. You need to reverse or trace the application to find the correct function.`

## Technical Presentation
|Title|Link|
|-----|----|
|Frida Intercept Encrypted Api|https://medium.com/p/a5c4ef22a093|
|Frida Intercept Encrypted API &#124; Technical &#124; How to Intercept Encrypted APIs on The Application &#124; Part 1|https://youtu.be/BIB3ma3Tl34|
|Frida Intercept Encrypted API &#124; Technical &#124; How to Intercept Encrypted APIs on The Application &#124; Part 2|https://youtu.be/IojcakLNtrA|

