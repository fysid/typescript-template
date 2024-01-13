import { NS } from "@ns"
import { getNukedServers } from "./lib";

export async function main(ns: NS): Promise<void> {
    share(ns);
}


export function share(ns: NS) {
    const scriptRAM = ns.getScriptRam("hacks/share.js");
    ns.tprint(`share script ram ${scriptRAM}`)
    const servers: Array<string> = getNukedServers(ns);
    for (const server of servers) {
        ns.killall(server, true);
        ns.scp("hacks/share.js", server, "home");
        
        let serverThreads: number;
        if (server == "home" ) {
            serverThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - 32) / scriptRAM);
        } else {
            serverThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) ) / scriptRAM);
        }

        if (serverThreads === 0 ) continue;
        ns.exec("hacks/share.js", server, serverThreads);
    }
}