import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {z} from "zod";
import {hashPassword, verifyPassword} from "@utils/hash.js";
import {prisma} from "@lib/prisma.js";

export async function authRoutes(server: FastifyTypedInstance) {
    server.post("/auth/login", {
        schema: {
            body: z.object({
                email: z.string({
                    message: "O email é obrigatório."
                }).email({
                    message: "O email deve ser válido."
                }),
                password: z.string({
                    message: "A senha é obrigatória."
                }).min(6, {
                    message: "A senha deve conter pelo menos 6 letras."
                })
            }),
            response: {
                200: z.object({
                    message: z.string(),
                    token: z.string()
                }),
                403: z.object({
                    message: z.string()
                })
            }
        }
    }, async (req, res) => {
        const { email, password } = req.body;

        const isUserExists = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!isUserExists) {
            return res.status(403).send({
                message: "Nenhum usuário encontrado."
            });
        }

        const isValidPassword = await verifyPassword(password, isUserExists.password);

        if (!isValidPassword) {
            return res.status(403).send({
                message: "Senha não está correta."
            })
        }

        const tokenJwt = server.jwt.sign({
            id: isUserExists.id,
            email: isUserExists.email
        });

        return res.status(200).send({
            message: "Usuário autenticado com sucesso!",
            token: tokenJwt
        })
    });

    server.post("/auth/register", {
        schema: {
            body: z.object({
                name: z.string({
                    message: "O nome é obrigatório e deve começar com uma letra."
                }).min(3, {
                    message: "O nome deve conter no mínimo 3 letras."
                }),
                email: z.string({
                    message: "O email é obrigatório."
                }).email({
                    message: "O email deve ser valido."
                }),
                password: z.string({
                    message: "A senha é obrigatório."
                }).min(6, {
                    message: "A senha deve conter no mínimo 6 letras"
                })
            }),
            response: {
                200: z.object({
                    message: z.string()
                }),
                400: z.object({
                    message: z.string()
                })
            }
        },
    }, async (req, res) => {
        const {
            name,
            email,
            password
        } = req.body;

        const isUserExist = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (isUserExist) {
            return res.status(400).send({
                message: "Já existe um usuário com esse email."
            })
        }

        const passwordHash = await hashPassword(password);

        await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash
            }
        });

        return res.send({
            message: "Usuário criado com sucesso!"
        })
    });
}