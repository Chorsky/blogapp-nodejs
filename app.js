//carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser  = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
const usuario = require('./routes/usuario');
const passport = require('passport');
require('./config/auth')(passport); 
const db = require('./config/db');
mongoose.Promise = global.Promise;

//configs
    //Sessao
        app.use(session({
            secret: 'cursonode',
            resave: true,
            saveUninitialized: true            
        }));
        
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(flash());
    //Middlewares    
        app.use((req,res,next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null 
            next()            
        });
    //body parser    
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());

    //Config Template
        app.engine('handlebars',handlebars({defaultLayout:'main'}));
        app.set('view engine','handlebars');

    //mongoose
        mongoose.connect('mongodb+srv://admin:34263386@blogapp-primeiro-node.0hvsi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
        }).then(() => {

            console.log('Conectado com sucesso');

        }).catch((err)=>{

            console.log(err);

        })

    //public 
        app.use(express.static(path.join(__dirname,"public")));

//rotas

    app.get('/',(req,res) => {

        Postagem.find().populate("categoria").sort({data:"desc"}).lean().then((postagens) => {

            res.render('index',{postagens:postagens});
    
        }).catch((err) => {
    
            req.flash('error_msg','Houve um erro ao selecionar as postagens');
            res.redirect('/404');
            
        })            

    })

    app.get('/postagem/:slug',(req,res)=>{
        Postagem.findOne({slug:req.params.slug}).lean().then((postagem) => {

            if(postagem){

                res.render('postagem/index',{postagem:postagem});

            }else{

                req.flash('error_msg','Esta postagem não existe');
                res.redirect('/');

            }
        }).catch((err)=>{

            req.flash('error_msg','Houve um erro ao selecionar a postagem');
            res.redirect('/');

        })
    })

    app.get('/categorias',(req,res) => {        

        Categoria.find().lean().sort({date:'desc'}).then((categorias) => {

            res.render('categorias/index',{categorias:categorias});
    
        }).catch((err)=>{
    
             req.flash('error_msg','Erro ao listar a categoria');
             res.redirect('/');
    
        });
        
    })

    app.get('/categorias/:slug',(req,res) => {

        Categoria.findOne({slug:req.params.slug}).lean().then((categoria) => {

            if(categoria){

                Postagem.find({categoria:categoria._id}).lean().then((postagem) => {

                    res.render('categorias/postagens',{postagem:postagem,categoria:categoria});

                }).catch((err)=>{

                    req.flash('error_msg','Não existe postagens vinculadas com essa categoria');
                    res.redirect('/');

                });

            }else{             

                req.flash('error_msg','Esta categoria não existe');
                res.redirect('/');

            }
    
        }).catch((err)=>{
    
             req.flash('error_msg','Erro ao listar a categoria');
             res.redirect('/');
    
        });
    })

    app.get('/404',(req,res) => {
        res.send('ERRO 404');
    })

    app.use('/admin',admin);
    app.use('/usuarios',usuario);

//lOCALHOST
const PORT = process.env.PORT || 8081 
app.listen(PORT,() => {
    console.log('Servidor ativo');
});