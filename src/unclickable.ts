import { NS } from "@ns";

export async function main(ns: NS) {
    // TODO implement this exploit
    let target = document.getElementById("unclickable");
    if (target != null) {
        target.style.display = "block";
        target.style.position = "realtive";
        target.style.top = "50%";
        target.style.left = "50%";
        target.style.width = "100px";
        target.style.height = "100px";
        target.style.zIndex = "10000";
        target.style.background = "red";
        target.style.opacity = "1";
    }
    ns.tprint(target?.textContent);
}