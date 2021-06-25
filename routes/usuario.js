const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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
                    senha: req.body.senha,
                    eAdmin: 1               
                });

                bcrypt.genSalt(10,(erro,salt) => {
                    bcrypt.hash(novoUsuario.senha, salt,(erro,hash) => {

                        if(erro){

                            req.flash('error_msg','Houve um erro ao cadastrar o usuário!');
                            res.redirect('/');

                        }

                        novoUsuario.senha = hash;

                        novoUsuario.save().then(() => {

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