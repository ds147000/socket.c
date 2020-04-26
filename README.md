# socket.c
#####致力于简单化socket连接，内置封装基础心跳包，重连等程序。开发人员只关心自己业务逻辑进行开发


## 快速使用
#### 浏览器
```javascript
    <script  scr="./dist/socket.c.min.js" />
    <script>
        var ws = SocketC.createConnection("ws://127.0.0.1:9999")
    </script>
```
#### webpack
- 命令行安装
```javascript
    npm i SocketC
```
- 在文件中
```javascript
    import { createConnection } from 'socket.c'

    const ws = createConnection("ws://127.0.0.1:9999") 
```

## API
 - **createConnection(config)**
    创建一个webSocket连接, 并返回一个**socket**实例。
    config参数具有以下属性
	```js
		{
			url: '', // url
			heartBeat: ['PING', 'PENG'], //心跳包字段
			heartMaxNumber: 3, //心跳包最大离线次数
			hearTinterval: 10000, //心跳包发生间隔
			sendType: 'JSON', //发送的数据格式，用于发送数据前对数据处理
			messageType: 'JSON', //消息数据格式，用于接收数据后对数据的处理
			restartMaxNumber: 3, //最大重连数
			restartTinterval: 3000
		}
	```
	
- **closeConnection(socket)**
	关闭socket的连接
	
- **destroyConnection**
	关闭并销毁socket实例

### config 可选参数


| 字段  | 类型 | 作用 | 默认值 |

| ------------ | ------------ | ------------ | ------------ |

|  url | string  | websocket连接地址 | '' |

|  heartBeat |  Array<String> | ```['PING', 'PENG']``` 心跳包交互字段，heartBeat[0]客户端发送字段，heartBeat[1]服务端回复字段 | ['PING', 'PENG'] |

| heartMaxNumber  | Number | 心跳包最大离线次数，当服务端回复连续掉包次数大于此值时候会自动断开socket连接，并进行重新连接 | 3 |

| hearTinterval | Number | 心跳包发送间隔 | 10000 |

| sendType | string | 对发送后端的消息进行处理，可选值有 'STRING','JSON','BUFF'。设为STRING时候会传入数据处理为字符串在提交，设为JSON时候会对发送数据前进行校验是否为JSON，然后再转为JSON字符串进行数据到服务端。设为BUFF时候会对数据发送前进行校验是否为BUFF，然后进行数据提交 | JSON |

| messageType | string | 说明后端回复数据的类型，可选值有 'STRING','JSON','BUFF'。设为STRING时候不会进行任何处理,接收数据不为STRING将数据串化。设为JSON会接收数据进行JSON.parse处理，接收数据不为JSON字符串将过滤。设为 BUFF不会对数据进行任何处理 | JSON |

| restartMaxNumber | number | 最大重连次数 | 3 |

| restartTinterval | number | 重连机制间隔,单位ms | 3000 |



## socket 实例

具有以下方法
- send(msg)
向服务端发送数据


- subscribe(callback)
订阅服务端消息，当接收到服务端消息后进行订阅发布，回调传入参数为消息实体。返回订阅ID

- unSubscribe(id)
取消订阅，id = 订阅ID

- close()
手动关闭连接

- destroy()

手动销毁实例

###socke t实例的生命钩子
- onOpen 
当连接socket成功触发的钩子

- onMessage
当接收到访问端数据后触发的方法，传入参数为消息实体

- onClose
当连接已超过最大重连次数或被手动关闭

- onRes
当socket重新连接前触发的钩子,传如参数为实例对象
 
- onDestroy
销毁前触发钩子


