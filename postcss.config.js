module.exports = ({ file }) => {
    const path = require("path");
    const isUview = file && file.dirname && file.dirname.indexOf("uview-ui") > -1;
    const rootValue = isUview ? 375 : 750; // 判断条件 请自行调整
    return {
        parser: require("postcss-comment"),
        plugins: [
            require("postcss-import")({
                resolve(id, basedir, importOptions) {
                    console.log("Postcss配置:", basedir, importOptions);
                    if (id.startsWith("~@/")) {
                        return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3));
                    } else if (id.startsWith("@/")) {
                        return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2));
                    } else if (id.startsWith("/") && !id.startsWith("//")) {
                        return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1));
                    }
                    return id;
                }
            }),
            require("autoprefixer")({
                remove: process.env.UNI_PLATFORM !== "h5"
            }),
            require("@dcloudio/vue-cli-plugin-uni/packages/postcss"),
            require("postcss-pxtransform")({
                platform: "weapp",
                designWidth: rootValue
            })
        ]
    };
};
