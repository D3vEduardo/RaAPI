import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {fastifyCors, FastifyCorsOptions} from "@fastify/cors";

export function configureCors(server: FastifyTypedInstance) {
    const corsOptions: FastifyCorsOptions = {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://rainstalacoeseletricas.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    };
    
    server.register(fastifyCors, corsOptions);
}