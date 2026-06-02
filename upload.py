import urllib.request
import urllib.parse
import ssl
import mimetypes
import json

def upload_0x0():
    url = 'http://0x0.st'
    print("Uploading to 0x0.st...")
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    with open('deploy.zip', 'rb') as f:
        file_content = f.read()
        
    parts = []
    parts.append(f'--{boundary}'.encode('utf-8'))
    parts.append('Content-Disposition: form-data; name="file"; filename="deploy.zip"'.encode('utf-8'))
    parts.append('Content-Type: application/zip'.encode('utf-8'))
    parts.append(b'')
    parts.append(file_content)
    parts.append(f'--{boundary}--'.encode('utf-8'))
    parts.append(b'')
    
    body = b'\r\n'.join(parts)
    
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    req.add_header('User-Agent', 'Mozilla/5.0')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = response.read()
            # Write raw bytes to file to prevent encoding errors
            with open('upload_result.txt', 'wb') as out_f:
                out_f.write(b"0x0.st: " + result + b"\n")
            print("Completed 0x0.st upload attempt.")
            return True
    except Exception as e:
        print(f"Error during 0x0.st upload: {e}")
        return False

def upload_file_io():
    url = 'https://file.io'
    print("Uploading to file.io...")
    
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    with open('deploy.zip', 'rb') as f:
        file_content = f.read()
        
    parts = []
    parts.append(f'--{boundary}'.encode('utf-8'))
    parts.append('Content-Disposition: form-data; name="file"; filename="deploy.zip"'.encode('utf-8'))
    parts.append('Content-Type: application/zip'.encode('utf-8'))
    parts.append(b'')
    parts.append(file_content)
    parts.append(f'--{boundary}--'.encode('utf-8'))
    parts.append(b'')
    
    body = b'\r\n'.join(parts)
    
    req = urllib.request.Request(url, data=body, method='POST')
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    req.add_header('User-Agent', 'Mozilla/5.0')
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            result = response.read()
            # Append result to file
            with open('upload_result.txt', 'ab') as out_f:
                out_f.write(b"file.io: " + result + b"\n")
            print("Completed file.io upload attempt.")
            return True
    except Exception as e:
        print(f"Error during file.io upload: {e}")
        return False

if __name__ == '__main__':
    # Try both to see which one succeeds
    upload_0x0()
    upload_file_io()
