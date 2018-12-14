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

// 在当前文件目录下下载ws模块 npm install ws
// 启动 node WebSocketServer.js
var WebSocketServer = require('ws').Server,

wss = new WebSocketServer({ port: 8181 });

wss.broadcast = function(ws,message){
    wss.clients.forEach(client=>{
        if(ws!=client){
            client.send(message)
        }
    })
}

wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        console.log(message);   
        wss.broadcast(ws,message);
    });
    ws.on('close',function(){
        console.log('close');
    });
});

console.log('websocket: ws://localhost:8181')
