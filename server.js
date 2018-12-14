var http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')

var server = http.createServer(function(request, response){
    var pathObj = url.parse(request.url, true);                         // 获取输入的url解析后的对象
    var staticPath = path.resolve(__dirname, 'static');                 // static文件夹的绝对路径
    var filePath = path.join(staticPath, decodeURI(pathObj.pathname));  // 获取资源文件绝对路径
    fs.readFile(filePath, 'binary', function(err, fileContent){         // 异步读取file
        if(err){
            console.log(filePath+'  404')
            response.writeHead(404, 'not found')
            response.end('<h1>404 Not Found</h1>')
        }else{
            console.log(filePath+'  ok')
            response.writeHead(200, {'Content-Type':'text/html'});
            response.write(fileContent, 'binary')
            response.end()
        }
    })
});
server.listen(8080);
console.log('visit http://localhost:8080')
