const express=require('express');
const mysql=require("mysql");
const myconnection=require("express-myconnection");
const app=express();

//create connection
const db= {
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DBNAME
}

app.set('view engine','ejs');
app.set('views','src');
app.use(express.static(__dirname+"/src"));
app.use(express.urlencoded({extended:false}));

app.use(myconnection(mysql,db,'pool'));


//log in
app.get("/",(req,rep)=>{
    req.getConnection((erreur,conect)=>{
    if(erreur){
        console.log(erreur);
        rep.status(404).render('err',{erreur})
    }
    else{
        conect.query("SELECT * FROM login",[],(err,login)=>{
            if (err) {
                console.log(err);
            }else{
                 rep.status(200).render("login",{login});
            }
        })
    }
    })
   
})

//vers la page index1 
app.post("/login",(req,rep)=>{
    let pass=req.body.password;
    let rsql=`SELECT * FROM login WHERE pass='${pass}'`;
    req.getConnection((erreur,conect)=>{
        if(erreur){
            console.log(erreur);
            rep.status(404).render('err',{erreur})
        }
        else{
            if(req.body.tester=="1"){ //tester la validation de password
                conect.query(rsql,[],(erreur,IdAdmin)=>{ //recuperer la valeur de id de password password
                    if (erreur) {
                        console.log(erreur);
                    }
                    Select_Donnee(conect,rep,IdAdmin);
                });
            }
            else{
                rep.redirect("/");
            }        
        }
    })
    
})
//khofa
app.post("/khofa",(req, res) => {
  let rsql=`SELECT * FROM login WHERE id='${0}'`;
  const cnekhofa = req.body.cnekhofa;
  const sql = `UPDATE etudiant SET khofa = '${1}' WHERE CNE = '${cnekhofa}'`;
  req.getConnection((erreur,conect)=>{
    if(erreur){
        console.log(erreur);
        res.status(404).render('err',{erreur})
    }
    else{
        conect.query(sql,(err,result)=>{
            if (err) {
                console.log(err);
            }else{
                conect.query(rsql,[],(erreur,IdAdmin)=>{
                    if (erreur) {
                        console.log(erreur);
                    }
                    Select_Donnee(conect,res,IdAdmin);
                })
            }
        })
    }
    })
});

//valider
  app.post("/valider",(req, res) => {
    let rsql=`SELECT * FROM login WHERE id='${0}'`;
    const cneValide = req.body.cneValide;
    const sql = `UPDATE etudiant SET jour = '${1}' WHERE CNE= '${cneValide}'`;
    req.getConnection((erreur, conect) => {
      if(erreur){
          console.log(erreur);
          res.status(404).render('err',{erreur})
      }
      else{
          conect.query(sql,(err,result) => {
              if (err) {
                  console.log(err);
              }else{
                    conect.query(rsql,[],(erreur,IdAdmin)=>{
                        if (erreur) {
                            console.log(erreur);
                        }
                        Select_Donnee(conect,res,IdAdmin);
                    })
                }
          })
      }
    })
  });
  
//log out
app.post("/logout",(req,rep)=>{
    req.getConnection((erreur,conect)=>{
    if(erreur){
        console.log(erreur);
        rep.status(404).render('err',{erreur})
    }
    else{
        conect.query("SELECT * FROM login",[],(err,login)=>{
            if (err) {
                console.log(err);
            }else{
                 rep.redirect("/");
            }
        })
    }
    })
   
})

//modifier password
app.post("/modifypwrd",(req, res) => {
    let remarque="";
    const oldPassword = req.body.oldpassword;
    const newPassword=req.body.newpassword;
    const sql = `UPDATE login SET pass = '${newPassword}' WHERE pass = '${oldPassword}'`;
    req.getConnection((erreur,conect)=>{
      if(erreur){
          console.log(erreur);
          res.status(404).render('err',{erreur})
      }
      else{
          conect.query(sql,(err,result)=>{
              if (err) {
                  console.log(err);
              }else{
                res.redirect("/");
              }
          })
      }
      })
  });
//Supprimer Tout la jour
app.post("/ST_jour",(req, res) => {
    const sql = `UPDATE etudiant SET jour = '${0}' WHERE jour = '${1}'`;
    req.getConnection((erreur,conect)=>{
      if(erreur){
          console.log(erreur);
          res.status(404).render('err',{erreur})
      }
      else{
          conect.query(sql,(err,result)=>{
              if (err) {
                  console.log(err);
              }else{
                res.redirect("/");
              }
          })
      }
      })
})
////////charger les donnees
function Select_Donnee(conect,rep,IdAdmin){
    let sql=`SELECT CNE,khofa,jour FROM etudiant WHERE faculté='FSSM' AND  binificier ='${1}'`;
        conect.query(sql,[],(err,CNE)=>{
            if (err) {
                console.log(err);
            }else{                        
                let idAdmin=Object.values(JSON.parse(JSON.stringify(IdAdmin)));
                rep.status(200).render("index",{CNE,idAdmin});
            }
        })
}

app.post("/badgelogin",(req,rep)=>{
    remarque="";
    rep.status(200).render("loginBadge");
    
})
//charger l'image
app.post('/badge', (req, res) => {
    remarque="";remarque2="";
    const cneEntree=req.body.qr_text.toUpperCase();
    req.getConnection((erreur,conect)=>{
        if(erreur){
            console.log(erreur);
            res.status(404).render('err',{erreur})
        }
        else{
            conect.query(`SELECT COUNT(*) AS count FROM etudiant WHERE CNE = '${cneEntree}' AND binificier=${1}`,[],(err,results)=>{
                if (err) {
                    console.error(err);
                    return;
                }
                const count = results[0].count;
                if (count > 0) {
                    conect.query(`SELECT CNE,id_etudiant,image FROM etudiant WHERE  CNE= '${cneEntree}' `,[],(er,result)=>{
                        if (er) {
                            console.log(er);
                        }
                        else{
                            if (result.length > 0) {
                                const imageData = result[0].image;
                                const imageSrc = `data:image/jpeg;base64,${imageData.toString('base64')}`;
                                const id= result[0].id_etudiant;
                                const cne= result[0].CNE;
                                // Passer les données à la page principale
                                res.render('badge', { imageSrc: imageSrc,id:id,cne:cne });
                            } 
                            else {
                                res.status(404).send('probleme de telechargement des donnee');
                            }
                        }
                    });
                }   else {
                    //res.status(404).send('Image not found');
                    remarque="votre CNE n'est pas correct vous êtes maintenant dans la liste d'attente  "
                    remarque2=" الرقم الوطني للطالب الذي أدخلته غير صحيح أو أنت الآن في لائحة الإنتظار ";
                    res.render("loginBadge",{remarque:remarque,remarque2:remarque2});
                  // res.send(remarque);
                    
                }
            })
        }
    });
});
const port =process.env.PORT ||7000;
app.listen(port);
console.log("connection bien");