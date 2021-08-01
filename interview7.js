// 图片tab懒加载
const tabSrc = ((imgDOM = {}, preIndex) => {
    return function (curIndex) {
        let curImgDOM;
        curImgDOM = imgDOM[curIndex] || (imgDOM[curIndex] = document.querySelectorAll('.img-wrapper')[curIndex].querySelectorAll('img'));
        if (!curImgDOM || !curImgDOM.length) return;
        for (let i = 0; i < curImgDOM.length; i++) {
            const tabSrc = curImgDOM[i].getAttribute('tab-src');
            if (tabSrc) curImgDOM[i].setAttribute('data-src', tabSrc)
        }
        if (preIndex > -1) {
            const preImgDOM = imgDOM[preIndex];
            for (let i = 0; i < preImgDOM.length; i++) {
                const dataSrcUrl = preImgDOM[i].getAttribute('data-src');
                if (['done', null].includes(dataSrcUrl)) continue;
                preImgDOM[i].removeAttribute('data-src');
                preImgDOM[i].setAttribute('tab-src', dataSrcUrl)
            }
        }
        preIndex = curIndex
    }
})()

// 节流
(() => {
    let timeoutID = null;
    return function () {
        // 防抖怎么写
        // 就是一直点击 重新计算倒计时
        if (timeoutID) {
            clearTimeout(timeoutID);
            timeoutID = setTimeout(() => { timeoutID = null }, 3000)
        } else {
            console.log('你好，新生活')
            timeoutID = setTimeout(() => { timeoutID = null }, 3000)
        }
    }
})()

// 闭包缓存Promise实例
const getRes = (p => {
    return function (options) {
        if (p) return p;
        return (p = new Promise((res, rej) => {
            $.ajax(options)
                .then(data => res(data))
                .catch(err => rej(err))
        }))
    }
})()

// 手写Promise
// 还记得状态机吗，promise就是保存状态的
function  myPromise(execCallBack) {
    this.status = 'pending';
    this.value = null;
    this.onFulfilledCallbacks = [];

    const resolve = (value) => {
        this.value = value;
        this.status = 'fulfilled';
        this.onFulfilledCallbacks.forEach(callback => {
            callback(this.value)
        })
    }
    execCallBack(resolve)
}
myPromise.prototype.then = function (onfulfilledCallback) {
    if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(onfulfilledCallback)
    } else if (this.status === 'fulfilled') {
        onfulfilledCallback(this.value)
    }
}

// 面试题 实现不用new调用的类
function Parent (options) {
    if (this instanceof Parent) {
        this.name = options.name;
        this.age = options.age;
        return this
    } else {
        return new Parent(options)
    }
}

// 实现bind方法
Function.prototype.myBind = function (context, ...args) {
    // 这里的this就是那个被绑定参数的函数
    // 所以应该把那个函数编程context对象的方法
    context.fn = this;
    return function () {
        context.fn(...args)
    }
}
// 实现call方法
Function.prototype.myCall = function (context, ...args) {
    context.fn = this;
    context.fn(...args)
}
// 响应化 实现 传一个变量进来 set的时候执行回调
// let 和 const 声明的变量 不是 window的属性
function reactive(obj, prop, callback) {
    let temp = obj[prop];
    Object.defineProperty(obj, prop, {
        set: function (newVal) {
            if (newVal !== temp) {
                callback(newVal);
                // 千万不能直接给obj[prop]赋值，不然会循环触发
                temp = newVal
            }
        },
        get: function () {
            return temp
        }
    })
}

// event类
function myEvent () {
    this.watchers = {}
}
myEvent.prototype.addEventListener = function (name, watcher) {
    if (this.watchers[name]) {
        this.watchers[name].push(watcher)
    } else {
        this.watchers[name] = [];
        this.watchers[name].push(watcher)
    }
}
myEvent.prototype.emit = function (name, ...args) {
    if (!this.watchers[name]) return;
    this.watchers[name].forEach(watcher => {
        watcher(...args)
    })
}
// 还有remove

// proxy

// 模块化 你会写吗

// 响应化
// __ob__ 是一个 Observer 实例
// Dep.target 是一个Watcher实例
// Dep 实例 的 subs存的是Watcher实例
// 收集依赖 按理说是谁get了就把谁add进这个属性的dep实例中
// 递归 defineReactive -> observe -> new Observer -> walk 子层级 -> defineReactive
// defineReactive：依赖收集
// defineReactive 中的get方法
// observe：对象 或 数组 才会被观测
// Observer constructor：区分 对象(walk) 数组(observeArray) 调 不同的响应化方法

// 累加
const Add = a => b => c => (a + b + c)
const add = a => {
    // 连续调用 不断返回接受cur的函数，不断往a上累加
    const sum = b => {
        a += b;
        return sum
    };
    // 闭包最初始的a
    sum.sumOf = () => a
    return sum
}

// 不定参数
const wrap = (...args) => {
    const add = (...args1) => {
        // args 不断接受新参数args1
        args = [...args, ...args1];
        return add
    };
    // 调sumOf将之前接受的参数累加
    add.sumOf = () => args.reduce((acc, cur) => acc + cur);
    return add
}

// 递归尾调用
const add = (...args) => {
    return (...args1) => {
        if (!args1.length) return [...args, ...args1].reduce((acc, cur) => acc + cur);
        return add(...[...args, ...args1])
    }
}

// 这种基本只能用一次，多次调用会相互影响
const add = ((args = []) => {
    const subAdd = (...a) => {
        args.push(...a);
        return subAdd
    };
    subAdd.sumOf = () => args.reduce((acc, cur) => acc + cur);
    return subAdd
})()

// 这种也一样，基本只能用一次
function Add() {
    if (!Add.nums) { Add.nums = [] }
    Add.nums.push(...arguments);
    return Add;
}
Add.sumOf = () => { return Add.nums.reduce((a, b) => a + b) }

// 如果Add是一个类 其实可以通过原型上的某个方法
function Add () {
    this.args = []
}
Add.prototype.add = function (...a) {
    this.args.push(...a);
    return this
}
Add.prototype.sumOf = function () {
    return this.args.reduce((acc, cur) => acc + cur)
}

// reduce 实现 map
Array.prototype.myMap = function (fn, thisArg) {
    const result = [];
    this.reduce((acc, cur, index) => {
        result.push(fn.call(thisArg || null, cur, index, this))
    }, '');
    return result
}

// 使定时器没回调
console.log(0);
await delay(1000);
console.log(1);
const delay = (time) => new Promies((resolve) => setTimeout(resolve, time));

// 数组最大深度层级
const wrap = arr => {
    let deep = 1;
    const getDeep = arr => {
        let exitArr = false;
        arr.forEach(ele => {
          if (Array.isArray(ele)) {
              exitArr = true;
              getDeep(ele)
          }
        });
        if (exitArr) deep++
    };
    getDeep(arr);
    return deep
}

// 深克隆
// 要是支持传入对象或数组的话，从一开始就应该判断
// 但是没有考虑函数的情况，还有原型继承
const deepClone = arg => {
    const type = Object.prototype.toString.call(arg);
    if ('[object Object]' === type) {
        const newObj =  Object.create(Object.getPrototypeOf(arg));
        Object.keys(arg).forEach(key => {
            newObj[key] = deepClone(arg[key])
        });
        return newObj
    } else if ('[object Array]' === type) {
        const newArr = [];
        for (let v of arg) newArr.push(deepClone(v));
        return newArr
    } else {
        return arg
    }
}

// 还早着呢 VueRouter 和 Vuex
// react的基本用法

// async await 用法

function calcLastWordLen(str) {
    const wordArr = str.split(' ');
    const lastWord = wordArr[wordArr.length - 1];
    return lastWord.length
}

function countAlias (str, charForFind) {
    let count = 0;
    const charFind = charForFind.toLowerCase();
    for (let i = 0; i < str.length; i++) {
        const char = str[i].toLowerCase();
        if (charFind === char) count++
    }
    return count
}

// 实现Promise.all方法，入参接受一个数组，出参是res结果的数组
// 还有catch没处理，
function myPromiseAll (iteratorArr) {
    const len = iteratorArr.length;
    let resolvedCount = 0;
    const result = Array(len);
    return new Promise((resolve, reject) => {
        for (let [i, promise] of iteratorArr.entries()) {
            // 兼容传入的item非promise的情况
            if (!(promise instanceof Promise)) promise = Promise.resolve(promise);
            promise
                .then(resItem => {
                    resolvedCount++;
                    result[i] = resItem;
                    resolvedCount === len && resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        }
    })
}

// 实现instanceof
const myInstanceOf = (child, parent) => {}

// 实现forOf
const myForOf = () => {}

// 手写redux
// 主要就是 createStore 入参reducer回调 出参store
// 之前说的很对 你要知道自己简历里缺什么
class Parent {
    constructor(lastName) {
        console.log('父类this', this);
        this.lastName = 'Wang'
    }
}
class Child extends Parent {
    constructor(lN) {
        super();
        console.log('子类', this)
    }
}

// 使用reduce实现flat(一层)
const myFlat = arr => {
    return arr.reduce((acc, cur) => acc.concat(cur), [])
}
const flat = arr => {
    return arr.reduce((pre, cur) => {
        if (Array.isArray(cur)) {
            pre.push(...flat(cur))
        } else {
            pre.push(cur)
        }
        return pre
    }, [])
}
// 数组拍平
// 原生API
const flatten = arr => arr.flat(Infinity);

// generator
const gene = *() => {
    const a = yield 'nihaoi';
    console.log('a', a);  // nihaoi1
    const b = yield a + 'hello';
    console.log('b', b);
    return a + b
};
const g = gene();
const ni = g.next(); // { value: 'nihaoi', done: false }
const he = g.next(); //
const llo = g.next()

// node.js中require方法实现
const myRequire = () => {
    // 我记得是 以字符串读取文件后 eval 导出module.exports
}

// 问到 Vuex ，只要 回答
// mutation 接受(state, payload)作为参数，通过$store.commit(mutation里的函数名, payload)调用，同步操作
// action 接受(store这个context, payload)作为参数，通过$store.dispatch(action里的函数名, payload)调用，支持异步

// 问到 webpack， 只要回答
// 常用的loader：css-loader style-loader style-loader/url url-loader file-loader babel-loader
// 所以你大概知道一些 内联style标签（css-loader + style-loader）link标签（file-loader + style-loader/url）
// 然后再看看 plugin
// 所以你现在知道了 几个常用的plugin了 仅仅是知道功能和简单的配置，并没太多用处

// 每个vue文件分别打包 import(/* webpackChunkName: "[request]" */ `views/${component}`)
// 所以你对代码分割理解了吗，

// 你讲一下OSI七层模型
// 感觉这个只能靠背一下了 毕竟解释不清

// 从输入URL到页面展示过程
// DNS 将 域名 解析为 IP地址 （优先 取 缓存）

// 浮动 是贴着content边缘
// BFC：隐式转换成inline-block的属性（position:absolute/fixed;float:left/right;overflow:!visible;display:inline-block;display:flex/grid的直接子元素）
// content-type: text/html text/plain application/json application/x-www-form-urlencoded application/octet-stream multipart/form-data
// form表单 通过enctype指定content-type类型

// 自定义事件 DOM event

// 堆叠上下文
// 触发条件：
// position: absolute/relative && z-index !== 'auto' 或 position: fixed

// 冒泡排序
const bubbleSort = arr => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]
            }
        }
    }
    return arr
}
// 选择排序
const selectionSort = arr => {
    let minIndex;
    for (let i = 0; i < arr.length - 1; i++) {
        minIndex = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
    }
    return arr
}
// 快速排序
const partition = (arr, left, right) => {
    const pivot = left, index = pivot + 1;
    for (let i = index; i <= right; i++) {
        if (arr[i] < arr[pivot]) {
            [arr[i], arr[piovt]] = [arr[piovt], arr[i]];
            index++
        }
    }
    [arr[pivot], arr[index - 1]] = [arr[index - 1], arr[pivot]];
    return index - 1
}
const quickSort = (arr, left, right) => {
    let len = arr.length,
        partitionIndex,
        left = typeof left !== 'number' ? 0 : left,
        right = typeof right !== 'number' ? len - 1 : right;
    if (left < right) {
        partitionIndex = partition(arr, left, right);
        quickSort(arr, left, partitionIndex-1);
        quickSort(arr, partitionIndex+1, right)
    }
    return arr
}

// 快排 原始版
const swap = (arr, l, r) => {
    const temp = arr[l];
    arr[l] = arr[r];
    arr[r] = temp
}
// arr[l+1...j] < v
// arr[j+1...i-1] > v
const __partition = (arr, l, r) => {
    const v = arr[l];
    let j = l; // j是属于小于v这部分的
    for (let i = l + 1; i <= r; i++) {
        // 当前位置 与 j+1位置 交换
        if (arr[i] < v) swap(arr[++j], arr[i]);
    }
    swap(arr[l], arr[j]);
    return j
}
const __quickSort = (arr, l, r) => {
    if (l >= r) return;
    const p = __partition(arr, l, r);
    __quickSort(arr, l, p - 1);
    __quickSort(arr, p + 1, r)
}

// 数组全排列
const combine = arr => {
    const result = [];
    if (arr.length === 1) result.push(arr);
    for (let i = 0; i < arr.length; i++) {
        const copyArr = [...arr];
        copyArr.splice(i, 1);
        const subResult = combine(copyArr);
        for (let j = 0; j < subResult.length; j++) {
            result.push([arr[i], ...subResult[j]])
        }
    }
    return result
}
// 列出所有子集
const getSubSet = arr => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const copyArr = [...arr];
        copyArr.splice(i, 1);
        console.log(copyArr);
        const subResult = getSubSet(copyArr);
        console.log('subResult', subResult);
        result.push(copyArr, ...subResult)
    }
    return result
}
// 对象拍平 拍到最后的原始类型
let obj = {
    a: {
        aa1: 123,
        aa2: [1, 2, 3],
        aa3: { aaa1: 456, aaa2: 789 }
    },
    b: [11, 12, 13],
    c: [{ cc1: 14, cc2: 15, cc3: 16 }, [17, 18], 19],
    d: 20
};
const objFlatten = arg => {
    const newObj = Object.create(Object.getPrototypeOf(arg));
    // 对象prop名拼接方法 .key
    const objJoin = (acc, cur) => {
        if (!acc) return cur;
        return `${acc}.${cur}`
    };
    // 数组prop名拼接方法 [key]
    const arrJoin = key => `[${key}]`;
    const joinProp = (value, accKey) => {
        const type = Object.prototype.toString.call(value);
        if (type === '[object Object]') {
            Object.keys(value).forEach(p => joinProp(value[p], objJoin(accKey, p)))
        } else if (type === '[object Array]') {
            Object.keys(value).forEach(p => joinProp(value[p], accKey + arrJoin(p)))
        } else {
            newObj[accKey] = value
        }
    };
    joinProp(arg, '');
    return newObj
}

// 批处理
let executeCount = 0
const fn = nums => {
    executeCount++
    return nums.map(x => x * 2)
}
const batcher = f => {
    const accNums = [];
    let p;
    // 你要返回的是一个保存了
    return function (nums) {
        const begin = accNums.length;
        accNums.push(...nums);
        if (!p) {
            p = new Promise(res => {
                Promise.resolve()
                    .then(() => {
                        const totalResult = fn.call(null, accNums);
                        res(totalResult)
                    })
            });
        }
        return new Promise(res => {
            p.then(accResults => {
                res(accResults.slice(begin, begin + nums.length))
            })
        })
    }
}
const batchedFn = batcher(fn);
const main = async () => {
    const [r1, r2, r3, r4] = await Promise.all([
        batchedFn([1,2,3]),
        batchedFn([4,5]),
        batchedFn([7,8,9]),
        batchedFn([10,11])
    ]);
    console.log('r', r1,r2,r3,r4)
}

// lazyMan
LazyMan('Hank'); // 输出:// Hi! This is Hank!
LazyMan('Hank').sleep(3).eat('dinner') // 输出:// Hi! This is Hank!// //等待3秒..// Wake up after 3// Eat dinner~
LazyMan('Hank').eat('dinner').eat('supper') // 输出:// Hi This is Hank!// Eat dinner~// Eat supper~
LazyMan('Hank').eat('dinner').sleep(3).eat('supper').sleepFirst(2) // 输出:// //等待2秒..// Wake up after 2// Hi This is Hank!// Eat dinner~// //等待3秒..// Wake up after 2// Eat supper~
LazyMan('Hank').sleepFirst(2) .eat('dinner').sleep(3).eat('supper')
// 利用status和watcherQueue实现，调用时根据status判断是立即执行还是push进watcherQueue，sleep时间到后会清空watcherQueue
function LazyMan (name) {
    if (!(this instanceof LazyMan)) {
        return new LazyMan(name)
    }
    console.log('Hi! This is ' + name);
    this.watcherCallback = [];
    this.status = 'fulfilled';
}
LazyMan.prototype.sleep = function (delay) {
    this.status = 'pending';
    setTimeout(() => {
        this.status = 'fulfilled';
        console.log('Wake up after ' + delay);
        this.watcherCallback.forEach(callback => callback.call(this))
    }, delay);
    return this
}
LazyMan.prototype.eat = function (something) {
    const fn = () => console.log('Eat ' + something);
    if (this.status === 'pending') {
        this.watcherCallback.push(fn)
    } else if (this.status === 'fulfilled') {
        fn()
    }
    return this
}

// 不论sleepFirst出现在哪个位置，总是最先执行
// 发布订阅模式
function LazyMan (name) {
    if (!(this instanceof LazyMan)) return new LazyMan(name);
    console.log(`Hi! This is ${name}`);
    this.watcherQueue = [];
    setTimeout(() => this.next(), 0)
}

function eat (something) { console.log(`Eat ${something}`) }

function sleep (delay) { console.log(`Wake up ${delay} later`) }

LazyMan.prototype.next = function () {
    const callback = this.watcherQueue.shift();
    callback && callback()
}

LazyMan.prototype.eat = function (something) {
    this.watcherQueue.push(() => {
        eat(something);
        this.next()
    });
    return this
}

LazyMan.prototype.sleep = function (delay) {
    // 你只管push就行了
    this.watcherQueue.push(() => {
        setTimeout(() => {
            sleep(delay);
            this.next()
        }, delay)
    });
    return this
}

LazyMan.prototype.sleepFirst = function (delay) {
    this.watcherQueue.unshift(() => {
        setTimeout(() => {
            sleep(delay);
            this.next()
        }, delay)
    });
    return this
}

// 现在 执行完 观察者队列 里都有 函数了
// 然后呢 队列里的函数 要一个个引爆 从哪个开始引爆
LazyMan('Json').eat('dinner').sleep(3000).eat('lunch').sleepFirst(4000)

// 斐波那契数列
// 0 1 1 2 3 5 8 13
// f(n) = f(n - 1) + f(n - 2)
const fibonacci = n => {
    if (n === 1) return 0;
    if (n === 2) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2)
}

// 青蛙跳台阶 1 2 3 5
const jumpTimes = n => {
    if (n === 1) return 1;
    if (n === 2) return 2;
    return jumpTimes(n - 1) + jumpTimes(n - 2)
}
