const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host:"email-ssl.com.br",
    port:587,
    secure:false,
    auth:{
        user:"email@evernet.com.br",
        pass:"Net@142536"
    }
});

router.get('/registro',(req,res) => {

    res.render('usuarios/registro');

});

router.post('/registro',(req,res)=>{
    var erros = [];

    if(!req.body.nome || !req.body.email || !req.body.senha || !req.body.senha2){

        erros.push({texto:'Preencha os campos corretamente!'});

    }

    if(req.body.senha.length < 4){

        erros.push({texto:'A senha é muito curta!'});

    }

    if(req.body.senha != req.body.senha2){

        erros.push({texto:'As senha não coincidem!'});

    }

    if(erros.length > 0){

        res.render('usuarios/registro',{erros:erros});

    }else{

        Usuario.findOne({email:req.body.email}).lean().then((usuario) => {

            if(usuario){

                req.flash('success_msg','Já existe uma conta registrada nesse email!');
                res.redirect('/usuarios/registro');

            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha                    
                });

                bcrypt.genSalt(10,(erro,salt) => {
                    bcrypt.hash(novoUsuario.senha, salt,(erro,hash) => {

                        if(erro){

                            req.flash('error_msg','Houve um erro ao cadastrar o usuário!');
                            res.redirect('/');

                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {

                            transporter.sendMail({

                                from:"Suporte blogapp <email@evernet.com.br>",
                                to:req.body.email,
                                subject:"Bem-vindo ao nosso blog, sua conta foi registrada com sucesso!",
                                text:"Muito obrigado por se cadastrar em nosso site",
                                html:"Para começar a criar seus posts e interagir com nossa plataforma<a href='https://young-wildwood-27820.herokuapp.com'>clique aqui</a>"

                            }).then(message => {

                                console.log(message);

                            }).catch(err => {

                                console.log(err);
                                 
                            })

                            req.flash('success_msg','Usuário cadastrado com sucesso!');
                            res.redirect('/');

                        }).catch((err) => {

                            req.flash('error_msg','Houve um erro ao cadastrar o usuário!');
                            res.redirect('/usuarios/registro');

                        })
                    })
                });
            }

        }).catch((err) => {

            req.flash('error_msg','Houve um erro no nosso sistema!');

        });
    }
})  

router.get('/login',(req,res) => {    

    res.render('usuarios/login');
    
})

router.post('/login',(req, res, next) => {

    passport.authenticate('local', {
        successRedirect:"/",
        failureRedirect: "/usuarios/login",
        failureFlash:true
    })(req,res,next)

});

router.get('/logout',(req,res) => {

    req.logout();
    req.flash('success_msg','Deslogado com sucesso!');
    res.redirect('/');

});

module.exports = router;