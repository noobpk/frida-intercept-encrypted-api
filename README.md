# frida-ios-intercept-api
A tool to help you intercept api in iOS apps

## Usage
 1. Set up Burp listener
     - Listen on 127.0.0.1:26080
     - Redirect to 127.0.0.1:27080 and Check (Support invisible proxying)
 1. Run echoServer.py
 1. Config handlers.js
 1. Run burpTracer.py