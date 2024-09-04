const passport = require("passport")
const local = require("passport-local")
const sessionModel = require("../models/user.model.js")
const { createHash, isValidPassword } = require('../utils/utils.js');
const GithubStrategy = require("passport-github2")
const localStrategy = local.Strategy
const CustomError = require("../services/custom.Error");
const EErrors = require("../services/enum.js");
const generateUserErrorInfo = require("../services/info.js");
const initializePassport = () => {


    passport.use("github", new GithubStrategy({

        clientID: "Iv23li0RedCn10Drgrsk",
        clientSecret: "25d82812a83c0ce2c82b6331152685f924fd6f22",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            console.log("1//githubStrategy ", profile)
            let user = await sessionModel.findOne({ email: profile._json.email })
            if (!user) {

                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    email: profile._json.email,
                    password:"",
                    isAdmin: false

                    }
                    let result = await sessionModel.create(newUser)
                    done(null,result)
            }
            else{
                done(null,user)
            }


        } catch (error) {
            return done(error)
        }

    }
    ))


   /* passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            console.log("2// passport", username, password)
            // 2//  te@mail.com te
            const { last_name, first_name, email, isAdmin } = req.body;
            console.log("1// passport", req.query)
            // 1// passport {}
            try {
                let user = await sessionModel.findOne({ email: username });
                if (user) return done(null, false);
                const newUser = new sessionModel({
                    first_name,
                    last_name,
                    email,
                    password: createHash(password),
                    isAdmin
                });
                let result = await newUser.save();

                return done(null, result);

            } catch (error) {
                return done("error al obtener al usuario", error);
            }
        })
    )*/

        passport.use('register', new localStrategy(
            { passReqToCallback: true, usernameField: 'email' },
            async (req, username, password, done) => {
                const { last_name, first_name, email, isAdmin } = req.body;
                console.log(req.body)
        
                try {
                    if (!last_name || !first_name || !email ) {
                        const errorMessage = generateUserErrorInfo({ last_name, first_name, email});
                        CustomError.createError({
                            name: "ValidationError",
                            cause: errorMessage,
                            message: "Error en la creación del usuario",
                            code: EErrors.INVALID_TYPES_ERROR
                        });
                        return done(new Error("Faltan campos requeridos"), false);
                    }
        
                    let user = await sessionModel.findOne({ email: username });
                    if (user) {
                        return done(null, false, { message: "El usuario ya existe" });
                    }
        
                    const newUser = new sessionModel({
                        first_name,
                        last_name,
                        email,
                        password: createHash(password),
                        isAdmin
                    });
        
                    let result = await newUser.save();
                    return done(null, result);
        
                } catch (error) {
                    console.error("Error en el registro de usuario:", error); // Mostrar en la consola
                    return done(error);
                }
            })
        );
        




    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await sessionModel.findById(id)
        done(null, user)
    })

    passport.use("login", new localStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = await sessionModel.findOne({ email: username })
            if (!user) {
                console.log("el usuario no existe")
                return done(null, user)
            }
            if (!isValidPassword(user, password))
                return done(null, false)
            return done(null, user)
        } catch (error) {
            return done(error)

        }
    }))

}

module.exports = { initializePassport };