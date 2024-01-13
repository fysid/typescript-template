import { NS, Player, Server } from "@ns";
import { getNukedServers, getServers } from "./lib";
import { GetServersForHack, updateOptimalServers } from "./hack_all_servers";


const hackAnalyzePath = "Temp/hackAnalyze.txt";
const serverMemoryReport = "Temp/serverMemoryReport.txt";
const weakeDecreaseSecurity = 0.05;
// const growIncreaseSecurity = ; growthAnalyzeSecurity
const hackIncreaseSecurity = 0.002;
const weakenCost = 1.75; // GB
const hackCost = 1.7; // GB
const growCost = 1.75; // GB
const reserverRamHome = 32; // GB


export async function main(ns: NS): Promise<void> {
    const serversToHack = GetServersForHack(ns, hackAnalyzePath);
}


export function InitialGetRAM(server: Server) {
    if (server.hostname === "home") {
        server.maxRam -= reserverRamHome;
    }
    return server.maxRam;
}


export async function name(ns: NS) {
    const servers = getNukedServers(ns).map((a) => ns.getServer(a));
    let serverAndRam = new SortedArray();
    for (const server of servers) {
        serverAndRam.push([server.hostname, InitialGetRAM(server)]);
    }


    async function GetFreeMemory(ns: NS) {
        const portMemory = ns.getPortHandle(1);
    
        for (;;) {
            let rowData = portMemory.read();
            if (rowData = "“NULL PORT DATA”") {
                await ns.sleep(100);
                continue;
            }
            if (rowData.split(",")[0] != "freeRam") {
                ns.alert(`1 port wrong message\n${rowData}`);
                throw `1 port wrong message\n${rowData}`;
            }
        }
    }
}


class SortedArray {
    sortedServersByRAMAvaliable: Array<[hostname: string, RAMdiff: number]>;

    constructor() {
        this.sortedServersByRAMAvaliable = [];
    }


    get(): [hostname: string, RAM: number] | undefined {
        return this.sortedServersByRAMAvaliable[0];
    }

    push(val: [hostname: string, RAM: number]): void {
        this.sortedServersByRAMAvaliable.push(val);
        this.sortedServersByRAMAvaliable.sort((a, b) => b[1] - a[1]);
    }

    update(val: [hostname: string, RAMdiff: number]): void {
        const index = this.sortedServersByRAMAvaliable.findIndex(a => a[0] === val[0]);
        if (index !== -1) {
            this.sortedServersByRAMAvaliable[index][1] += val[1];
            this.sortedServersByRAMAvaliable.sort((a, b) => b[1] - a[1]);
        }
    }
}

/*
 1) server, operation, n threads
 2) [ram1], [ram2], [ram3],
 3) weaken
 4) grow
 5) hack
*/
