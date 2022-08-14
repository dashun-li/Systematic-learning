import babel from "rollup-plugin-babel";

export default {
    input: "./src/index.js",
    output:{
        file:"./dist/vue.js",
        //new Vue
        name:"Vue", //在global上增加vue变量
        format:"umd", //esm es6 commonjs iife umd（commonjs amd） (打包生成的格式)
        sourcemap: true, //希望可以调试源代码
    },
    plugins:[
        babel({
            exclude:"node_modules/**"
        })
    ]
}