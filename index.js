const express=require("express");
const bodyParser=require("body-parser");
const knex=require("knex");
const app=express();
const cors=require("cors");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const PORT=process.env.PORT || 3001;

const db=knex({
    client:"pg",
    connection:{
        connectionString:process.env.DATABASE_URL,
        ssl:true
        // host:"127.0.0.7",
        // user:"postgres",
        // password:"test",
        // database:"bus"
    }
});





app.post("/register",(req,res)=>{
    const {name,email,password}=req.body;
    
    db.transaction(trx=>{
        trx.insert({
            name:name,
            email:email,
            password:password
            
        })
        .into("signup")
        .returning(["email","password"])
        .then(data=>{
           return trx("signin").insert({
                email:data[0].email,
                password:data[0].password
            })
            .returning('*')
            .then(data=>{
                res.json(data);
            })
            .catch(e=>{
                res.json({
                    error:"database error"
                });
            })
        }).then(trx.commit)
        .catch(trx.rollback)
    }).catch(e=>{
        res.json({
            error:"unable to register"
        });
    }) 
});





app.post("/signin",((req,res)=>{
    const credientials=[];
    const {email,password}=req.body;
    console.log(email,password);
    db.select("*").from("signin").where("email","=",email).then(data=>{
        var isValid=data[0].email === email && data[0].email !==" " && data[0].password === password && data[0].password !==" ";
        if(isValid){
            res.json({"login":"true"});
        }
        else{
            res.json({"login":"false"});
        }
    }).catch(e=>{
        res.json({
            error:"User Not Found"
        })
    })
   
}));





app.get("/getusers",(req,res)=>{
    db.select("*").from("signup").then(data=>{
        res.json(data)
    }).catch(e=>{
        res.json({
            error:"Failed to fetch users"
        });
    })
});


// app.post("/getusers/:id",(req,res)=>{
//     const {id}=req.params;
//     console.log(id);
//     db.select("*").from("users").where("id","=",id).then(data=>{
//         res.json(data)
//     }).catch(e=>{
//         res.json({
//             error:"Failed to fetch users"
//         });
//     })
// });





// app.patch("/editusers",(req,res)=>{
//     const {id,name,email,phone,company,country,password}=req.body;
//     console.log(id,name,email,phone,company,country,password);
//     db("users").where("id","=",id).update({
//         name:name,
//         email:email,
//         phone:phone,
//         company:company,
//         country:country,
//         password:password
//     })
//     .returning("*")
//     .then(data=>{
        
//         console.log(data);
//         if(data[0].id){
//             res.json(data);
//         }
//     }).catch(e=>{
//         res.json({
//             error:"unable to edit user"
//         });
//     })
// });




// app.delete("/deleteusers",(req,res)=>{
//     const {id}=req.body;
   
//     db("users").where("id","=",id).del().returning("*").then(data=>{
//         if(data[0].id){
//             res.json(data);
//         }
//     }).catch(e=>{
//         res.json({
//             error:"Cannot Able To Delete"
//         });
//     });
// });




app.get("/",(req,res)=>{
    res.json("Working....!");
})

app.listen(PORT,()=>{
    console.log(`Server is listening to ${ PORT }`);
});