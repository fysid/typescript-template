import { NS } from "@ns";
import { getServers } from "lib";
import { dfs } from "lib";

export function main(ns: NS): void {
    if (!ns.args.length) {
        ns.tprint(getServers(ns));
        return;
    }

    const target = ns.args[0] as string;
    ns.tprint(target);
    const server = "home";
    const visited: Set<string> = new Set();
    const servers = dfs(server, target, visited, ns);
    let result: string = "\n";
    
    for (const server of servers) {
        result += "ssh " + server + "; ";
    }
    ns.tprint(result);
}
