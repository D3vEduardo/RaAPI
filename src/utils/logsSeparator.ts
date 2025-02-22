import chalk from "chalk";
import { consola } from "consola";

export function logsSeparator(qtd = 40) {
    let separator = "";
    for (let i = 0; i <= qtd; i++) {
        separator += "-";
    }

    consola.log(chalk.gray(separator));
}