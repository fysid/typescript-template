import { NS, Player, Server } from "@ns";

const maxMoneyMulti = 0.9;
const addMinSecurity = 5;

export async function main(ns: NS): Promise<void> {
    if (ns.args.length < 3) {
        return;
    }
    const server = ns.args[0] as string;
    const maxMoney = ns.args[1] as number;
    const minSecurityLvl = ns.args[2] as number;
    let weakenCount = 0;
    let growCount = 0;
    for(;;) {
        if (ns.getServerSecurityLevel(server) > minSecurityLvl + addMinSecurity) {
            await ns.weaken(server);
            ++weakenCount;
        }
        else if (ns.getServerMoneyAvailable(server) < maxMoney * maxMoneyMulti) {
            await ns.grow(server);
            ++growCount;
        }
        else {
            ns.print(`INFO money for hack = ${await ns.hack(server)}\ngrowCount ${growCount}\tweakenCount ${weakenCount}`);
            growCount = 0;
            weakenCount = 0;
        }
    }
}

export function TestLowGrade(ns: NS, server: Server, player: Player, threads: number, maxMoney: number, minSecurityLvl: number, initialTime: number = 1250000): [hostname: string, mps: number, startAfter: number, threads: number, hackTimes: number] {

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
