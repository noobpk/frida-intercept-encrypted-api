import frida
import requests
import time
import sys
import os
import argparse
from log import *

print ('''\033[1;31m \n
  _  ____   _____   _____       _                          _   
 (_)/ __ \ / ____| |_   _|     | |                        | |  
  _| |  | | (___     | |  _ __ | |_ ___ _ __ ___ ___ _ __ | |_ 
 | | |  | |\___ \    | | | '_ \| __/ _ \ '__/ __/ _ \ '_ \| __|
 | | |__| |____) |  _| |_| | | | ||  __/ | | (_|  __/ |_) | |_ 
 |_|\____/|_____/  |_____|_| |_|\__\___|_|  \___\___| .__/ \__|
        https://noobpk.github.io      #noobteam     | |        
           Intercept Api in iOS Application         |_|        
''')

print ("\033[1;34m[*]___author___: @noobpk\033[1;37m")
print ("\033[1;34m[*]___version___: 1.0\033[1;37m")
print ("")

def check_platform():
    try:
        platforms = {
        'linux'  : 'Linux',
        'linux1' : 'Linux',
        'linux2' : 'Linux',
        'darwin' : 'OS X',
        'win32'  : 'Windows'
        }
        if sys.platform not in platforms:
            sys.exit(logger.error("[x_x] Your platform currently does not support."))
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

def check_ps_for_win32():
    try:
        if sys.platform == "win32":
            PROCESSNAME = "iTunes.exe"
            for proc in psutil.process_iter():
                try:
                    if proc.name() == PROCESSNAME:
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
                    pass
            return sys.exit(logger.error("[x_x] Please install iTunes on MicrosoftStore or run iTunes frist."))              
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

def run(identifier):
    #check platform support
    check_platform()
    #check process iTunes for Win32s
    check_ps_for_win32()
    #check python version
    if sys.version_info < (3, 0):
        logger.error("[x_x] iOS hook requires Python 3.x")
        sys.exit(0)
    else:
        handle_del_log()
        main(identifier)

def handle_del_log():
    try:
        pwd = os.getcwd()
        path = pwd + '/errors.log'
        file_stats = os.stat(path)
        if (file_stats.st_size > 1024000000): #delete errors.log if file size > 1024 MB
            os.remove(path)
        else:
            return True
    except Exception as e:
        logger.error("[x_x] Something went wrong when clear error log. Please clear error log manual.\n Message - {0}".format(e))

BURP_HOST = "127.0.0.1"
BURP_PORT = 26080

def frida_process_message(message, data):
    handled = False
    print ('message:',  message)
    if message['type'] == 'input':
        handled = True
        print (message["payload"])
    elif message['type'] == 'send':
        stanza = message['payload']

        if stanza['from'] == '/http':
            req = requests.request('FRIDA', 'http://%s:%d/' % (BURP_HOST, BURP_PORT), headers={'content-type':'text/plain'}, data=stanza['payload'])
            script.post({ 'type': 'input', 'payload': req.text })
            handled = True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--package", required=True)
    args = vars(parser.parse_args())
    try:
        device = frida.get_usb_device()
        pid = device.spawn([args['package']])
        device.resume(pid)
        time.sleep(1)
        session = device.attach(pid)
        with open("handlers.js") as f:
            script = session.create_script(f.read())
        script.on("message", frida_process_message)
        script.load()
        input()

    #EXCEPTION FOR FRIDA
    except frida.ServerNotRunningError:
        logger.error("Frida server is not running.")
    except frida.TimedOutError:
        logger.error("Timed out while waiting for device to appear.")
    except frida.TransportError:
        logger.error("[x_x] The application may crash or lose connection.")
    #EXCEPTION FOR OPTIONPARSING

    #EXCEPTION FOR SYSTEM
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

    except KeyboardInterrupt:
        logger.info("Bye bro!!")
        # sys.exit(0)

if __name__ == '__main__':
    main()
