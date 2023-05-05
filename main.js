const fs = require("fs");
const crawler=require("crawler");
const cheerio = require("cheerio")
const Config = {
	//书的目录地址
	url:"http://www.luoshenol.com/book/27_27536/",
	//输出文件
	outFile:"./dali.txt"
}


getCatalog()
function getCatalog(){
	var Catalog = new crawler({
		encoding:null,
		jQuery:false,
		callback:function(err,res,done){
			if(err){
				console.log(err);
				return;
			}
			//获取文本并且解析
			let $ = cheerio.load(res.body.toString())
			//目录数组
            let arr = []
            let zhangjieArray=[]
            $("#list dl dd a").each((i, e) => {
                zhangjieArray.push({i,e})
				//书的地址
       
            })
            zhangjieArray.reverse()
            zhangjieArray.map(item => {
                let i = item.i;
                let e = item.e;
				let href = $(e).attr("href").split("/")[3]
				
				//章节分页做处理 默认每章分4页
                for (let index = 1; index <= 4; index++) {
                    let res = ''
                    let title=''
                    if (index > 1) {
                      res=  href.replace(".html",'_'+index+".html")
                    } else {
                        res = href
                        title= $(e).text()
                    }
                    		let json = {
					href:res,
					//标题
                                title: title,
                    index:index
				}
				arr.push(json)
                }
		
                
            })
			//获取数据
			getPage(arr,0,arr.length)
		}
	});
	
	Catalog.queue({
		//书目录地址
		url:Config.url,
		//模仿客户端访问
		headers:{'User-Agent': 'requests'},
	})
}

function getPage(arr,idx,len) {
	if(idx >= len) {
		console.log('爬书完成！');
		return
	}
	var page = new crawler({
		encoding:null,
		jQuery:false,
		callback:function(err,res,done){
			if(err){
				console.log(err);
				return;
			}
			let $ = cheerio.load(res.body.toString())
			//把标题加入到每一张的前面
            let info = "\n" + arr[idx].title + '\n' + $("#content").text()
			fs.appendFile(Config.outFile,info,function(e) {
				if(e) return
				//输出当前状态
				console.log("已完成：" + arr[idx].title);
				//递归调用本函数以获取下一章内容
				getPage(arr,idx+1,len)
			})
		}
    });
    console.log(Config.url+arr[idx].href);
	page.queue({
		url:Config.url+arr[idx].href,
		headers:{'User-Agent': 'requests'},
	})
}