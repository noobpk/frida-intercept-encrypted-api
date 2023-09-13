import frida
import requests
import time
import sys
import os
import socket
import argparse
from log import *

print ('''\033[1;31m \n
  ___       _                          _        _    ____ ___ 
 |_ _|_ __ | |_ ___ _ __ ___ ___ _ __ | |_     / \  |  _ \_ _|
  | || '_ \| __/ _ \ '__/ __/ _ \ '_ \| __|   / _ \ | |_) | | 
  | || | | | ||  __/ | | (_|  __/ |_) | |_   / ___ \|  __/| | 
 |___|_| |_|\__\___|_|  \___\___| .__/ \__| /_/   \_\_|  |___|
                                |_|
        https://noobpk.github.io      #noobteam       
           Intercept Api in iOS/Android Application       
''')

print ("\033[1;34m[*]___author___: @noobpk\033[1;37m")
print ("\033[1;34m[*]___version___: 1.3\033[1;37m")
print ("")

BURP_HOST = "127.0.0.1"
BURP_PORT = 26080

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

def check_echo_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1',27080))
    if result == 0:
       logger.info("[*] Connect to echoServer successfully.")
    else:
        sock.close()
        sys.exit(logger.error("[x_x] Please start echoServer."))
    
def run():
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
        main()

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
        logger.error("[x_x] Something went wrong when clear error log. Please clear error log manual.\n [Error Message] - {0}".format(e))

def main():
    def frida_process_message(message, data):
        handled = False
        print ('message:',  message)
        if message['type'] == 'input':
            handled = True
            print (message["payload"])
        elif message['type'] == 'send':
            body = message['payload']
            API_PATH = body['api_path']

            if body['from'] == '/http':
                try:
                    req = requests.request('FRIDA', 'http://%s:%d/%s' % (BURP_HOST, BURP_PORT, API_PATH), headers={'content-type':'text/plain'}, data=body['payload'].encode('utf-8'))
                    script.post({ 'type': 'input', 'payload': req.text })
                    handled = True
                except requests.exceptions.RequestException as e:
                    logger.error("[x_x] Connection refused, please check configurage on BurpSute.\n [Error Message] - {0}".format(e))

    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--package")
    parser.add_argument("-n", "--name")
    parser.add_argument("-s", "--script", help='custom handler script')
    args, leftovers = parser.parse_known_args()

    try:
        # Spawing application with custom script
        if args.package is not None and args.script is not None:
            #check echoServer
            check_echo_server()
            #
            if os.path.isfile(args.script):
                logger.info('[*] Spawning: ' + args.package)
                logger.info('[*] Script: ' + args.script)
                time.sleep(2)
                device = frida.get_usb_device()
                pid = device.spawn(args.package)
                device.resume(pid)
                time.sleep(1)
                session = device.attach(pid)
                with open(args.script) as f:
                    script = session.create_script(f.read())
                script.on("message", frida_process_message)
                script.load()
                input()
            else:
                logger.error('[?] Script not found!')
        #Attaching default script to application
        if args.name is not None and args.script is not None:
            #check echoServer
            check_echo_server()
            #
            logger.info('[*] Attaching: ' + args.name)
            logger.info('[*] Script: ' + args.script)
            time.sleep(2)
            process = frida.get_usb_device().attach(args.name)
            with open(args.script) as f:
                script = process.create_script(f.read())
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
    run()
