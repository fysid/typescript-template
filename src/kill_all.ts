import { NS } from "@ns" 
import { getServers } from "./lib"

export function main(ns: NS) {
    const servers = getServers(ns);
    let pid;
    for (const server of servers) {
        if (server === "home") {
            for (const script of ns.ps(server)) {
                if (script.filename === "hack_all_servers.js") {
                    continue;
                }
                if (script.filename === "kill_all.js") {
                    pid = script.pid;
                    continue;
                }
                ns.kill(script.pid);
            }
        } else {
            ns.killall(server);
        }
    }
}