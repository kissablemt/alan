# -*- coding:utf-8 -*-
import os
import re
import requests

headers = {'Accept': 'text/html, application/xhtml+xml, image/jxr, */*',
               'Accept - Encoding':'gzip, deflate',
               'Accept-Language':'zh-Hans-CN, zh-Hans; q=0.5',
               'Connection':'Keep-Alive',
               'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063'
           }

def mkdir(filename):
    if not os.path.exists(filename):
        os.makedirs(filename)
    
def getUrl(keyword):
    url = 'http://image.baidu.com/search/flip?tn=baiduimage&ie=utf-8&word=' + keyword + '&ct=201326592&v=flip'
    return requests.get(url, headers=headers)
    

def dowmloadPic(html, keyword):
    mkdir('product/' + keyword)
    pic_url = re.findall('"objURL":"(.*?)",', html, re.S)
    i = 1
    j = 0
    print('找到关键词:' + keyword + '的图片，现在开始下载图片...')
    for each in pic_url:
        try:
            j += 1
            pic = requests.get(each, headers=headers, timeout=3)
        except requests.exceptions.ConnectionError:
            #print('【错误】当前图片无法下载')
            continue

        dir = 'product/' + keyword + '/' + keyword + '_' + str(i) + '.jpg'
        fp = open(dir, 'wb')
        fp.write(pic.content)
        fp.close()
        i += 1
        if i==4 or j==10:
            break

def spiderProduct():
    f=open("product.txt")
    while True:
        line=f.readline()
        if not line:
            break
        line=line.replace('\n','')
        result=getUrl(line)
        dowmloadPic(result.text, line)
        

if __name__ == '__main__':
    spiderProduct()
    
