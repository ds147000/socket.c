import process from 'process'
import { join } from 'path'
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from "rollup-plugin-uglify";
import babel from 'rollup-plugin-babel';

// rollup.config.js
export default {
    // 核心选项
    input: "./main.js",     // 必须
    output: {  // 必须 (如果要输出多个，可以是一个数组)
        // 核心选项
        file: join('./server', process.env.type === 'cjs' ? "index.js" : "socket.c.min.js"),    // 必须
        format: process.env.type === 'cjs' ? "cjs" : "iife",  // 必须
        name: "SocketC",
    },
    plugins: [
        resolve()
    ],
};