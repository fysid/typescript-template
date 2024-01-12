import { NS, Player, Server } from "@ns"
import { getNukedServers } from "./lib";


export async function main(ns: NS) {
    ns.disableLog("sleep");
    await updateOptimalServersTest(ns);
    ns.tprint("WARNING\ncat test.js")
}

const testHackAnalyzePath = "Temp/testHackAnalyze.txt";
const maxMoneyMulti = 0.9;
const addMinSecurity = 5;

export async function updateOptimalServersTest(ns: NS): Promise<void> {
    const results = new Array<[hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number]>();
    const servers = getNukedServers(ns)

    for (const serverName of servers) {
        const server = ns.getServer(serverName);
        const player = ns.getPlayer();
        const maxMoney = server.moneyMax;
        const minSecurityLvl = server.minDifficulty;

        if (serverName === "home" || maxMoney == undefined || maxMoney == 0 || minSecurityLvl == undefined) {
            continue;
        }

        const serverResults = new Array<[hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number]>();
        for (let i = 800; i < 1500; i++) {
            let serv = ns.getServer(serverName);
            serverResults.push(CopyOfTestLowGrade(ns, serv, player, i, maxMoney, minSecurityLvl));
            await ns.sleep(0);
        }
        serverResults.sort((a, b) => b[1] - a[1]).filter((a) => a[1] != 0 && a[4] > 1);
        results.push(serverResults[0]);
    }
    const finalResults = results.sort((a, b) => b[1] - a[1]).filter((a) => a[1] > 0 && a[4] > 1);
    ns.tprint(finalResults.join("\n"));
    ns.write(testHackAnalyzePath, JSON.stringify(finalResults), "w");
}

export function CopyOfTestLowGrade(ns: NS, server: Server, player: Player, threads: number, maxMoney: number, minSecurityLvl: number, initialTime: number = 1250000): [hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number] {

    let timeForGetIncome = 0;
    const weakenSecurity = 0.05;
    const growSecurity = 0.005;
    const hackSecurity = 0.002;


    if (ns.formulas.hacking.weakenTime(server, player) >= 1250000) return[server.hostname, 0, 1250000/1000, -1, 0];
    const curSecurity = server.hackDifficulty;
    server.hackDifficulty = server.minDifficulty;
    if (ns.formulas.hacking.growTime(server, player) >= 1250000) return[server.hostname, 0, 1250000/1000, -1, 0];
    server.hackDifficulty = curSecurity;
    
    if (server.hackDifficulty === undefined) {
        throw `ERROR ${server.hostname} has ${server.hackDifficulty} security lvl`;
    }
    if (server.moneyAvailable === undefined) {
        throw `ERROR ${server.hostname} has ${server.moneyAvailable} moneyAvailable`;
    }
    while (server.moneyAvailable < maxMoney*maxMoneyMulti && server.hackDifficulty > minSecurityLvl+addMinSecurity) {
        if (server.hackDifficulty > minSecurityLvl +addMinSecurity) {
            timeForGetIncome += ns.formulas.hacking.weakenTime(server, player);
            server.hackDifficulty = Math.max(server.hackDifficulty - (weakenSecurity * threads), minSecurityLvl);
        }
        if (server.moneyAvailable < maxMoney * maxMoneyMulti) {
            timeForGetIncome += ns.formulas.hacking.growTime(server, player);
            let growPercent = ns.formulas.hacking.growPercent(server, threads, player);
            server.moneyAvailable = Math.min(server.moneyAvailable * growPercent + threads, maxMoney);
            server.hackDifficulty += growSecurity * threads;
        }
    }


    let income = 0;
    let hackTimes = 0;
    let time = initialTime;
    while (time > 0) {
        if (server.hackDifficulty === undefined) {
            throw `ERROR ${server.hostname} has ${server.hackDifficulty} security lvl`;
        }
        if (server.moneyAvailable === undefined) {
            throw `ERROR ${server.hostname} has ${server.moneyAvailable} moneyAvailable`;
        }
        while (server.moneyAvailable < maxMoney*maxMoneyMulti && server.hackDifficulty > minSecurityLvl+addMinSecurity) {
            if (server.hackDifficulty > minSecurityLvl +addMinSecurity) {
                time -= ns.formulas.hacking.weakenTime(server, player);
                server.hackDifficulty = Math.max(server.hackDifficulty - (weakenSecurity * threads), minSecurityLvl);
            } else if (server.moneyAvailable < maxMoney * maxMoneyMulti) {
                time -= ns.formulas.hacking.growTime(server, player);
                let growPercent = ns.formulas.hacking.growPercent(server, threads, player);
                server.moneyAvailable = Math.min(server.moneyAvailable * growPercent + threads, maxMoney);
                server.hackDifficulty += growSecurity * threads;
            }
        }
        time -= ns.formulas.hacking.hackTime(server, player);
        if (time <= 0) continue;
        if (server.moneyAvailable === undefined) {
            throw `ERROR ${server.hostname} has ${server.moneyAvailable} moneyAvailable`
        }
        if (server.hackDifficulty === undefined) {
            throw `ERROR ${server.hostname} has ${server.hackDifficulty} security lvl`;
        }

        const hackPercent = ns.formulas.hacking.hackPercent(server, player)
        const hackChance = ns.formulas.hacking.hackChance(server, player);
        const stealMoney = server.moneyAvailable * Math.min(hackChance * hackPercent * threads, 1);
        
        hackTimes++;
        income += stealMoney;
        server.moneyAvailable = Math.max(0, server.moneyAvailable - stealMoney);
        server.hackDifficulty += (hackSecurity * hackChance);
    }
    const incomePerThread = income / threads;
    const result: [hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number] = [server.hostname, incomePerThread/initialTime, timeForGetIncome / 1000, threads, hackTimes];
    return result;
}