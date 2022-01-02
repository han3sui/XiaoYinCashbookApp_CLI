module.exports = {
    env: {
        browser: true,
        node: true,
        es2020: true
    },
    // extends: ["plugin:vue/recommended", "eslint:recommended", "@vue/prettier"],
    // parserOptions: {
    //   parser: "babel-eslint"
    // },
    extends: ["plugin:vue/recommended", "eslint:recommended", "@vue/prettier"],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module"
    },
    plugins: ["vue"],
    rules: {},
    globals: {
        uni: true
    }
};
