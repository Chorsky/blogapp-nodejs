const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eAdmin} = require('../helpers/eAdmin');


router.get('/',eAdmin,(req,res) => {
    res.render('admin/index');
});

router.get('/posts',eAdmin, (req,res) => {
    res.send('Pagina de posts');
});

router.get('/categorias',eAdmin, (req,res)=>{

    Categoria.find().lean().sort({date:'desc'}).then((categorias) => {

        res.render('admin/categorias',{categorias:categorias});

    }).catch((err)=>{

         req.flash('error_msg','Erro ao listar a categoria');
         res.redirect('/admin');

    });
    
});

router.get('/categorias/add',eAdmin,(req,res)=>{
    res.render('admin/addcategorias');
});

router.post('/categorias/nova',(req,res)=>{

    var erros = [];

    if(!req.body.nome || !req.body.slug || req.body.nome.length < 2){    

        erros.push({texto:'Preencha corretamente os campos!'});

    }

    if(erros.length > 0){

        res.render('admin/addcategorias',{erros:erros});

    }else{

        const novaCategoria = {
            nome:req.body.nome,
            slug:req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {

            req.flash('success_msg','Categoria criada com sucesso!');
            res.redirect('/admin/categorias');

        }).catch(() => {

            req.flash('error_msg','Erro ao adicionar a categoria');
            res.redirect('/admin/categorias');

        });

    }
})

router.get('/categorias/edit/:id',eAdmin,(req,res) => {

    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {

        res.render('admin/editcategoria',{categoria:categoria});

    }).catch((err) => {

         req.flash('error_msg','Essa categoria não existe');
         res.redirect('/admin/categorias');

    });    
});

router.post('/categorias/edit',eAdmin,(req,res) => {

    var erros = [];

    if(!req.body.nome || !req.body.slug || req.body.nome.length < 2){    

        erros.push({texto:'Preencha corretamente os campos!'});

    }

    if(erros.length > 0){

        Categoria.findOne({_id:req.body.id}).then((categoria) => {

            req.flash('error_msg','Preencha corretamente os campos!');
            res.redirect('/admin/categorias/edit/' + req.body.id);
    
        }).catch((err) => {
    
             req.flash('error_msg','Essa categoria não existe');
             res.redirect('/admin/categorias');
    
        }); 

    }else{
        
        Categoria.findOne({_id:req.body.id}).then((categoria) => {

            
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            
            categoria.save().then(() => {

                req.flash('success_msg','Categoria editada com sucesso!');
                res.redirect('/admin/categorias');

            }).catch((err) => {
                req.flash('error_msg','Erro ao editar categoria!');
                res.redirect('/admin/categorias');
            })

        }).catch((err) => {
    
            req.flash('error_msg','Erro ao editar categoria!');
            res.redirect('/admin/categorias');
    
        }); 
    }
});

router.post('/categorias/deletar',eAdmin,(req,res) => {

    Categoria.remove({_id:req.body.id}).then(() => {

        req.flash('success_msg','Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');

    }).catch((err) => {

        req.flash('error_msg','Erro ao deletar categoria!');
        res.redirect('/admin/categorias');

    })
});

router.get('/postagens',eAdmin,(req,res) => {

    Postagem.find().populate("categoria").sort({data:"desc"}).lean().then((postagens) => {

        res.render('admin/postagens',{postagens:postagens});

    }).catch((err) => {

        req.flash('error_msg','Houve um erro ao selecionar as postagens');
        res.redirect('/admin');
        
    })    
    

})

router.get('/postagens/add',eAdmin,(req,res) => {

    Categoria.find().lean().then((categorias) => {

        res.render('admin/addpostagem',{categorias:categorias});

    }).catch((err)=>{

        req.flash('error_msg','Houve um erro ao selecionar a categoria');

    })
    
})

router.post('/postagens/nova',eAdmin,(req,res) => {

    var erros = [];

    if(!req.body.titulo || !req.body.slug || !req.body.descricao || !req.body.conteudo){    

        erros.push({texto:'Preencha corretamente os campos!'});

    }

    if(!req.body.categoria ){

        erros.push({texto:'Selecione uma Categoria!'});

    }else if(req.body.categoria == 0){

        erros.push({texto:'Crie uma categoria primeiro!'});

    }

    if(erros.length > 0){

        res.render('admin/addpostagem',{erros:erros});

    }else{

        const novaPostagem = {
            titulo:req.body.titulo,
            slug:req.body.slug,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria
        }   
        
        new Postagem(novaPostagem).save().then(() => {

            req.flash('success_msg','Postagem criada com sucesso!');
            res.redirect('/admin/postagens');

        }).catch((err) => {

            req.flash('error_msg','Houve um erro ao criar a postagem!');
            res.redirect('/admin/postagens');

        })
    }
})

router.get('/postagens/editar/:id',eAdmin,(req,res) => {

    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {

            res.render('admin/editpostagem',{postagem:postagem,categorias:categorias});

        }).catch((err) => {

            req.flash('error_msg','Essa postagem não existe');
            res.redirect('/admin/postagens');

        })       

    }).catch((err) => {

        req.flash('error_msg','Essa postagem não existe');
        res.redirect('/admin/postagens');

    });  

});

router.post('/postagens/edit',eAdmin,(req,res) => {

    Postagem.findOne({_id:req.body.id}).then((postagem) => {

            
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;
        

        postagem.save().then(() => {

            req.flash('success_msg','Postagem editada com sucesso!');
            res.redirect('/admin/postagens');

        }).catch((err) => {

            req.flash('error_msg','Erro ao editar postagem!');
            res.redirect('/admin/postagens');

        })

    }).catch((err) => {

        req.flash('error_msg','Erro ao editar postagem!');
        res.redirect('/admin/postagens');

    }); 
});

router.post('/postagens/deletar',eAdmin,(req,res)=>{

    Postagem.remove({_id:req.body.id}).then(() => {

        req.flash('success_msg','Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');

    }).catch((err) => {

        req.flash('error_msg','Erro ao deletar postagem!');
        res.redirect('/admin/postagens');

    })

});

module.exports = router;