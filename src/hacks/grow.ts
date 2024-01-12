import { NS } from "@ns";
import { writePort } from "./lib";

export async function main(ns: NS): Promise<void> {
    if (ns.args.length != 2) {
        return;
    }
    const target = ns.args[0] as string;
    const hostname = ns.args[1] as string;
    
    await ns.grow(target);
    await writePort(ns, hostname, 1.75);
}
