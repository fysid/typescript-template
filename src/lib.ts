import { NS } from "@ns";

export const files: Array<string> = ["BruteSSH.exe", "relaySMTP.exe", "HTTPWorm.exe", "FTPCrack.exe", "SQLInject.exe"]

export const vpsNames = [
  'VanDarkholme',
  'LeatherClub',
  'GachiMuchiVan',
  'VanGuard',
  'DungeonMasterVan',
  'VanFlex',
  'VanForce',
  'VanStorm',
  'VanThunder',
  'VanWind'
];

export type WorkingServer = [name: string, freeRAM: number, UsedRam: number];

export function dfs(server: string, target: string, visited: Set<string>, ns: NS): Array<string> {
  visited.add(server);
  if (server === target) {
    return [server];
  }
  for (const neighbour of ns.scan(server)) {
    if (visited.has(neighbour)) {
      continue;
    }
    const dfsResult = dfs(neighbour, target, visited, ns)
    if (dfsResult.length) {
      return [server, ...dfsResult];
    }
  }
  return [];
}

export function getServers(ns: NS): Array<string> {
  const visited: Set<string> = new Set();
  const servers: Array<string> = ["home"]
  for (let i = 0; i < servers.length; ++i) {
    const current: string = servers[i]
    visited.add(current);
    
    const neighbours = ns.scan(current);
    for (const neighbour of neighbours) {
      if (visited.has(neighbour)) {
        continue;
      }
      servers.push(neighbour);
      visited.add(current);
      }
  }
  return servers;
}



export function hackPort(ns: NS, file: string, server: string): boolean{
  const portHackLaunchScript = new Map<string, (host: string) => void>([
    ["BruteSSH.exe", ns.brutessh],
    ["relaySMTP.exe", ns.relaysmtp],
    ["HTTPWorm.exe", ns.httpworm],
    ["FTPCrack.exe", ns.ftpcrack],
    ["SQLInject.exe", ns.sqlinject],
  ]);

  const func = portHackLaunchScript.get(file);
  if (func == undefined) {
    return false;
  }
  func(server);
  return true;
}


export function portsAvaible(ns: NS): Array<string> {
    const result: Array<string> = [];
    for (const file of files) {
      if (ns.fileExists(file)) {
        result.push(file);
      }
    }
    return result;
  }


export function getNukedServers(ns: NS): Array<string> {
    const servers: Array<string> = getServers(ns)
    const nukedServers: Array<string> = [];
    const hackScriptFiles = portsAvaible(ns)
    for (const server of servers) {
      if (ns.hasRootAccess(server)) {
        nukedServers.push(server);
        continue;
      }
      if (ns.getServerNumPortsRequired(server) <= hackScriptFiles.length && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
        for (const file of hackScriptFiles) {
          hackPort(ns, file, server);
        }
        ns.nuke(server);
        nukedServers.push(server);
      }
    }
    return nukedServers;
}
