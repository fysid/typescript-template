import { NS } from "@ns";
import { getNukedServers } from "./lib";
import { TestLowGrade } from "./hacks/low_grade_hack_spell";


const disableLogs = ["scp", "getServerMinSecurityLevel", "getServerMaxRam", "disableLog", "getServerNumPortsRequired", "getServerMaxMoney", "getHackingLevel", "getServerRequiredHackingLevel", "scan", "sleep"];
const hackAnalyzePath = "Temp/hackAnalyze.txt";


export function serverStats(ns: NS, hostname: string): Array<number> {
    const maxMoney = ns.getServerMaxMoney(hostname);
    const minSecurityLvl = ns.getServerMinSecurityLevel(hostname);
    return [maxMoney, minSecurityLvl]
}

export async function hack(ns: NS): Promise<void> {
    const servers: Array<string> = getNukedServers(ns);
    const serversToHack = GetServersForHack(ns, hackAnalyzePath);
    const scriptRAM = ns.getScriptRam("hacks/low_grade_hack_spell.js");
    const shareScriptRAM = ns.getScriptRam("hacks/share.js");
    for (const server of servers) {
        ns.killall(server, true);
        ns.scp("hacks/low_grade_hack_spell.js", server, "home");
        ns.scp("hacks/share.js", server, "home");
        
        let serverThreads: number;
        if (server == "home" ) {
            serverThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - 32) / scriptRAM);
        } else {
            serverThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) ) / scriptRAM);
        }

        while (serverThreads > 0) {
            if (serversToHack.length === 0) {
                const shareThreads = Math.floor((serverThreads * scriptRAM) / shareScriptRAM);
                if (shareThreads === 0) {
                    serverThreads = 0;
                    continue;
                }
                ns.exec("hacks/share.js", server, shareThreads);
                serverThreads = 0;
                continue;
            }
            if (serversToHack[0][1] === 0) {
                serversToHack.shift();
                if (serversToHack.length === 0) {
                    const shareThreads = Math.floor((serverThreads * scriptRAM) / shareScriptRAM);
                    if (shareThreads === 0) {
                        serverThreads = 0;
                        continue;
                    }
                    ns.exec("hacks/share.js", server, shareThreads);
                    serverThreads = 0;
                    continue;
                }
                continue;
            }
            const stats = serverStats(ns, serversToHack[0][0]);
            const threadsLaunch = Math.min(serversToHack[0][1], serverThreads);
            serversToHack[0][1] -= threadsLaunch;
            serverThreads -= threadsLaunch;
            ns.exec("hacks/low_grade_hack_spell.js", server, threadsLaunch, serversToHack[0][0], stats[0], stats[1]);
            /*
            if (unusedRAM > 0) {
            ns.tprint(`WARNING unusedRAM = ${unusedRAM}`);
            */
        }
    }
}


export async function main(ns: NS): Promise<void> {
    for(;;) {
        ns.print("update servers");
        // await updateOptimalServers(ns);
        ns.print("kill all");
        ns.exec("kill_all.js", "home");
        ns.print("launch hack")
        await hack(ns);
        ns.print("solve contract")
        ns.exec("contracts/contract_solver.js", "home")
        ns.print("launch stock_master");
        ns.exec("stock_master.js", "home");
        ns.print("sleeping for 1250000ms");
        await ns.sleep(1500000);
    }
}


export async function updateOptimalServers(ns: NS): Promise<void> {
    for (const log of disableLogs) {
        ns.disableLog(log);
    }
    const results = new Array<[hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number]>();
    const servers = getNukedServers(ns)
    let startTime = new Date();

    for (const serverName of servers) {
        if (serverName === "home") {
            continue;
        }
        const server = ns.getServer(serverName);
        const player = ns.getPlayer();
        const maxMoney = server.moneyMax;
        const minSecurityLvl = server.minDifficulty;
        if (maxMoney == undefined || maxMoney == 0 || minSecurityLvl == undefined) {
            ns.print(`skip ${serverName}`);
            continue;
        }
        const serverResults = new Array<[hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number]>();
        for (let i = 800; i < 1200; i++) {
            serverResults.push(TestLowGrade(ns, server, player, i, maxMoney, minSecurityLvl));
            await ns.sleep(0);
        }
        serverResults.sort((a, b) => b[1] - a[1]).filter((a) => a[1] != 0 && a[4] > 1);
        results.push(serverResults[0]);
        let timeNow = new Date();
        ns.print(`server = ${serverName}, time = ${timeNow.getTime() - startTime.getTime()}ms`);
        await ns.sleep(0);
        startTime = timeNow;
    }
    const finalResults = results.sort((a, b) => b[1] - a[1]).filter((a) => a[1] > 0 && a[4] > 1);
    ns.print(finalResults);
    ns.write(hackAnalyzePath, JSON.stringify(finalResults), "w");
}

export function GetServersForHack(ns: NS, hackAnalyzePath: string): [hostname: string, threads: number][] {
    const parseDataHackAnalyze = JSON.parse(ns.read(hackAnalyzePath));
    const serversForHack = new Array<[hostname: string, threads: number]>();
    for (const data of parseDataHackAnalyze) {
        serversForHack.push([String(data[0]), Number(data[3])]);
    }
    return serversForHack;
}
