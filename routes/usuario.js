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

                            transporter.sendMail({

                                from:"Suporte blogapp <email@evernet.com.br>",
                                to:req.body.email,
                                subject:"Bem-vindo ao nosso blog, sua conta foi registrada com sucesso!",
                                text:"Muito obrigado por se cadastrar em nosso site",
                                html:"<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><link rel='preconnect' href='https://fonts.gstatic.com'><link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' rel='stylesheet'></head><body bgcolor='#f6f6f6' style='font-family: 'Roboto', arial, sans-serif; font-size:13px; color:#111; line-height:24px'><table cellpadding='0' cellspacing='0' border='0' width='100%' align='center' bgcolor='#ffffff' style='border:1px #e8e8e8 solid; max-width:673px; margin-top:20px; border-radius:4px; overflow:hidden;'><tbody><tr><td align='center' style='background:#e5e5e5;height:110px;width:100%; display:inline-block;margin-bottom:20px'><br><img src='imagens/LogoTopo.png' height='75'><br><br></td></tr><tr><td align='center' style='background:#e3e3e3; height:auto;'><tr><td align='center' style='font-size:16px; line-height:25px; border-bottom:50px solid transparent;'><table  style='margin-top:85px'><tr><td height='24'><b>Seja bem-vindo ao nosso Blog feito em NodeJS</b></td><tr><tr></td><tr></table></td></tr><tr><td height='50px'></td></tr></td><tr></tbody></table><table cellpadding='0' cellspacing='0' border='0' align='center'><tr><td height='35px'>&nbsp;</td></tr><td align='center' style='font-size:14px; color:#818181;'>https://young-wildwood-27820.herokuapp.com</td></tr></table></body></html>"

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