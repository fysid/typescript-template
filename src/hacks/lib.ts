import { NS } from "@ns";
import { getNukedServers } from "/lib";


const hackAnalyzePath = "Temp/hackAnalyze.txt";
const serverMemoryReport = "Temp/serverMemoryReport.txt";

export async function writePort(ns: NS, hostname: string, ram: number): Promise<void> {
    let send = false;
    while (!send) {
        send = ns.tryWritePort(1, `freeRam,${hostname},${ram}`);
        await ns.sleep(50);
    }
}