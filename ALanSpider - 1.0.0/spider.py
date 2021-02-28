# -*- coding:utf-8 -*-
import os
import re
import requests

headers = {'Accept': 'text/html, application/xhtml+xml, image/jxr, */*',
               'Accept - Encoding':'gzip, deflate',
               'Accept-Language':'zh-Hans-CN, zh-Hans; q=0.5',
               'Connection':'Keep-Alive',
               'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 YaBrowser/19.3.1.828 Yowser/2.5 Safari/537.36'
           }

def mkdir(filename):
    if not os.path.exists(filename):
        os.makedirs(filename)
    
def getUrl(keyword):
    try:
        url = 'http://image.baidu.com/search/flip?tn=baiduimage&ie=utf-8&word=' + keyword + '&ct=201326592&v=flip'
        return requests.get(url, headers=headers, timeout=3)
    except:
        return 
    

def dowmloadPic(html, keyword):
    pic_url = re.findall('"objURL":"(.*?)",', html, re.S)
    i = 1
    j = 0
    #print('找到关键词:' + keyword + '的图片，现在开始下载图片...')
    for each in pic_url:
        if j==20:
            break
        try:
            j += 1
            pic = requests.get(each, headers=headers, timeout=3)
        except requests.exceptions.ConnectionError:
            #print('【错误】当前图片无法下载')
            continue

        dir = 'product/' + keyword + '.jpg'
        fp = open(dir, 'wb')
        fp.write(pic.content)
        fp.close()
        try:
            if os.path.getsize(dir) > 4500 and os.path.getsize(dir) < 100000:
                print(keyword,":Succeed!")
                break
        except:
            continue

def spiderProduct():
    f=open("product.txt")
    c = []
    while True:
        line=f.readline()
        if not line:
            break
        try:
            line=line.replace('\n','')
            result=getUrl(line)
            dowmloadPic(result.text, line)
        except:
            print("#",line,":Failed!!!")
            c.append(line)
            continue
    print("\n")
    for i in c:
        try:
            result=getUrl(i)
            dowmloadPic(result.text, i)
        except:
            print("##",line,":Failed!!!")
            continue
        

if __name__ == '__main__':
    spiderProduct()
    #dowmloadPic(getUrl("木瓜膏75g").text, "木瓜膏75g")
