if(process.env.NODE_ENV == "production"){

    module.exports = {mongoURI:"mongodb+srv://admin:<senha>@blogapp-primeiro-node.0hvsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"};

}else{
    module.exports = {mongoURI:"mongodb+srv://admin:<senha>@blogapp-primeiro-node.0hvsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"};
}
