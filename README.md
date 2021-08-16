# Frida iOS intercept api 

<img width="621" alt="image" src="https://user-images.githubusercontent.com/31820707/129575322-c601d548-1a48-4bcb-a23f-fefa751b93c1.png">

## What does it help?
Banking applications are increasingly enhanced with confidentiality. One of them is the encryption of request / response data when sending and receiving. Some weak encryptions can be decrypted easily, but some strong encryptions like RSA are difficult. Hooking into functions that send request/response and intercept data before it's encrypted is one way we can view and modify the data.

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

## Demo
https://youtu.be/hn1GV-JCpjc
