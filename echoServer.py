from http.server import HTTPServer, BaseHTTPRequestHandler
from optparse import OptionParser
from log import *
import sys

print ('''\033[1;31m \n
            _           _____                          
           | |         / ____|                         
   ___  ___| |__   ___| (___   ___ _ ____   _____ _ __ 
  / _ \/ __| '_ \ / _ \\___ \ / _ \ '__\ \ / / _ \ '__|
 |  __/ (__| | | | (_) |___) |  __/ |   \ V /  __/ |   
  \___|\___|_| |_|\___/_____/ \___|_|    \_/ \___|_|                                                                                                                        
''')
print ("\033[1;34m[*]___author___: @noobpk\033[1;37m")
print ("\033[1;34m[*]___version___: 1.0\033[1;37m")
print ("")

ECHO_PORT = 27080

class RequestHandler(BaseHTTPRequestHandler):

    def do_FRIDA(self):
        request_path = self.path

        request_headers = self.headers
        content_length = request_headers.get('content-length')
        # length = int(content_length[0]) if content_length else 0
        length = int(content_length) if content_length else 0

        self.send_response(200)
        self.end_headers()

        self.wfile.write(self.rfile.read(length))

def main():
    try:
        if sys.version_info < (3, 0):
            logger.error("[x_x] echoServer requires Python 3.x")
            sys.exit(0)
        else:
            logger.info('[*] Starting echoServer on port %d' % ECHO_PORT)
            logger.info('[*] Listening on 127.0.0.1:%d' % ECHO_PORT)
            server = HTTPServer(('', ECHO_PORT), RequestHandler)
            server.serve_forever()

    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))
        
    except KeyboardInterrupt:
        logger.info("Stop echoServer!!")

if __name__ == "__main__":
    main()