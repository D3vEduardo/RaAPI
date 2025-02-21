import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";

export default function (server: FastifyTypedInstace) {
    server.get("/", {
        schema: {
            tags: ["Root"],
            summary: "Root endpoint",
        }
    }, (req, res) => {
        res.redirect("/docs");
    });
}