import { NS } from "@ns";
import { dfs, getServers } from "/lib";

export type Contract = [server: string, type: string];

const disableLogs = ["disableLog", "getServerNumPortsRequired", "getServerMaxMoney", "getHackingLevel", "getServerRequiredHackingLevel", "scan"];


export function findContacts(ns: NS): Array<Contract> {    
    const servers = getServers(ns);
    const contracts = Array<Contract>();
    for (const server of servers) {
        const tasks = ns.ls(server, ".cct");
        if (tasks.length > 0) {
            for (const task of tasks) {
                contracts.push([server, task]);
            }
        }
    }
    return contracts;
}

export async function main(ns: NS): Promise<void> {
    for (const log of disableLogs) {
        ns.disableLog(log);
    }
    const contracts = findContacts(ns);
    for (const contract of contracts) {
        solveContract(ns, contract);
    }
}

export function solveContract(ns : NS, contract: Contract): void {
    const contractName = contract[1];
    const contractServer = contract[0];
    const contractType = ns.codingcontract.getContractType(contractName, contractServer);
    const data = ns.codingcontract.getData(contractName, contractServer);
    let result = null;
    switch(contractType) {
        case "Merge Overlapping Intervals":
            result = mergeOverlappingIntervals(ns, data);
            break;
        case "Compression I: RLE Compression":
            result = CompressionIRLECompression(data);
            break;
        case "Array Jumping Game II":
            result = ArrayJumpingGameII(data);
            break;
        case "Array Jumping Game":
            result = ArrayJumpingGameII(data);
            if (result > 0) {
                result = 1;
            }
            break;
        case "Sanitize Parentheses in Expression":
            ns.print(`INFO ${contractType} need comeBACK for solution\nserver = ${contractServer},\nname = ${contractName}`);
            return;
        case "Total Ways to Sum II":
            ns.print(`INFO ${contractType} need comeBACK for solution\nserver = ${contractServer},\nname = ${contractName}`);
            return;
        case "Algorithmic Stock Trader I":
            result = AlgorithmicStockTraderI(data);
            break;
        case "Algorithmic Stock Trader II":
            result = AlgorithmicStockTraderII(data);
            break;
        case "Find All Valid Math Expressions":
            ns.print(`INFO ${contractType} need comeBACK for solution\nserver = ${contractServer},\nname = ${contractName}`);
            // result = FindAllValidMathExpressions(ns, data);
            return;
        case "Generate IP Addresses":
            result = GenerateIPAddresses(data);
            break;
        case "Encryption I: Caesar Cipher":
            result = EncryptionICaesarCipher(data);
            break;
        case "Spiralize Matrix":
            result = SpiralizeMatrix(data);
            break;
        case "Subarray with Maximum Sum":
            result = SubarraywithMaximumSum(data);
            break;
        case "Find Largest Prime Factor":
            result = findLargestPrimeFactor(data);
            break;
        case "Unique Paths in a Grid II":
            result = UniquePathsinaGridII(data);
            break;
        case "Shortest Path in a Grid":
            // result = ShortestPathInAGrid(ns, data);
            ns.print(`INFO ${contractType} need comeBACK for solution\nserver = ${contractServer},\nname = ${contractName}`);
            return;
        case "Compression II: LZ Decompression":
            // result = CompressionIILZDecompression(data);
            ns.print(`INFO ${contractType} need comeBACK for solution\nserver = ${contractServer},\nname = ${contractName}`);
            return;
        default:
            ns.print(`WARNING ${contractType} need solution\nserver = ${contractServer}\nname = ${contractName}`);
    } 
    if (result != null) {
        const attemptResponse = ns.codingcontract.attempt(result, contractName, contractServer);
        if (attemptResponse === "") {
            ns.tprint(`ERROR ${attemptResponse} type = ${contractType}, name = ${contractName}, server = ${contractServer}`)
        } else {
            ns.print(attemptResponse);
        }
    }
}

export function mergeOverlappingIntervals(ns: NS, intervals: Array<[number, number]>): string {
    intervals.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
    let result = new Array<[number, number]>();
    result.push(intervals[0]);
    for (let i = 1; i < intervals.length; i++) {
        let start = intervals[i][0];
        let end = intervals[i][1];
        const prev_end = result[result.length - 1][1];
        if (start <= prev_end && end > prev_end) {
            result[result.length - 1][1] = end;
        } else if (start > prev_end) {
            result.push([start, end]);
        }
    }
    return JSON.stringify(result);
}

export function CompressionIRLECompression(s: string): string  {
    let prev = s[0];
    let count = 1;
    let result: string = "";
    for (let i = 1; i < s.length; i++) {
        if (s[i] === prev && count < 9) {
            count++;
        } else {
            result += `${count}${prev}`;
            count = 1;
            prev = s[i];
        }
    }
    result += `${count}${prev}`;
    return result;
}

export function TotalWaysToSumII (nums: Array<number>): number {
    const target = nums[0];
    nums.shift();
    let dp: Array<number> = new Array<number>(target+1).fill(0);
    dp[0] = 1;
    
    for (let num of nums) {
        for (let i = num; i <= target; i++) {
            dp[i] += dp[i - num];
        }
    }
    
    return dp[target];
}

export function ArrayJumpingGameII(arr: Array<number>): number {
    const n = arr.length;
    let dp = new Array<number>(n + 1).fill(Infinity);
    dp[0] = 0;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j <= i + arr[i] && j < n; j++) {
            dp[j] = Math.min(dp[j], dp[i] + 1);
        }
    }

    return dp[n - 1] === Infinity ? 0 : dp[n - 1];
}

export function AlgorithmicStockTraderI(prices: number[]): number {
    let result = 0;
    let minPrice = prices[0];
    for (let price of prices) {
        minPrice = Math.min(price, minPrice);
        result = Math.max(result, price - minPrice);
    }
    return result;
}

export function AlgorithmicStockTraderII(prices: number[]): number {
    let result = 0;
    for (let i = 0; i < prices.length - 1; ++i) {
        if (prices[i + 1] > prices[i] ) {
            result += prices[i + 1] - prices[i];
        }
    }
    return result;
}

export function FindAllValidMathExpressions(ns: NS, data: [string, number]): string[] {
    const str = data[0];

    const operations = ["+", "-", "*", ""]
    const result = new Array<string>();
    return result;
}

export function GenerateIPAddresses(data: string): string {
    const result = new Array<string>();

    function dfs(path: string, last: string, pos: number, dotCnt: number): void {
        if (dotCnt > 3) {
            return;
        }
        if (pos === data.length) {
            if (dotCnt != 3 && last == "") {
                return;
            }
            if (Number(last) > 255) {
                return;
            }
            if (dotCnt != 2 && last != "") {
                return;
            }
            path = `${path}.${last}`;
            result.push(path);
            return;
        }
        if (last === "0") {
            dfs(`${path}.${last}`, data[pos], pos+1, dotCnt+1);
            return;
        }
        if (last == "") {
            dfs(`${path}`, data[pos], pos+1, dotCnt);
            return;
        }
        if (Number(last) > 255) {
            return;
        }
        if (path != "") {
            dfs(`${path}.${last}`, data[pos], pos+1, dotCnt+1);
        } else {
            dfs(`${last}`, data[pos], pos+1, dotCnt);
        }
        dfs(`${path}`, `${last}${data[pos]}`, pos+1, dotCnt);
    }

    dfs("", "", 0, 0);
    return JSON.stringify(result);
}


export function EncryptionICaesarCipher(data: [string, number]): string {
    const str = data[0].toUpperCase();
    const unicodeA = "A".charCodeAt(0);
    const unicodeZ = "Z".charCodeAt(0);
    const shift = data[1] % 26;

    const cipher = new Array<number>();
    for (const c of str) {
        if (c === " ") {
            cipher.push(c.charCodeAt(0));
            continue;
        }
        let val = c.charCodeAt(0) - shift;
        if (val < unicodeA) {
            val = unicodeZ - (unicodeA - val - 1);
        }
        cipher.push(val);
    }

    const result = String.fromCharCode(...cipher);
    return result;
}

export function SpiralizeMatrix(data: Array<Array<number>>): string {
    const result = new Array<number>();
    const visited = new Array<Array<boolean>>(data.length);
    for (let i = 0; i < data.length; i++) {
        visited[i] = new Array<boolean>(data[0].length).fill(false);
    }
    const step = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let current: number = 0;
    let pos: [y: number, x: number] = [0, 0];
    let finish = false;
    while (!finish) {
        result.push(data[pos[0]][pos[1]]);
        visited[pos[0]][pos[1]] = true;
        let tmpPos: [y: number, x: number] = [pos[0] + step[current][0], pos[1] + step[current][1]]
        if (is_boardered(tmpPos[0], tmpPos[1]) && !visited[tmpPos[0]][tmpPos[1]]) {
            pos = tmpPos;
            continue;
        }
        current = (current + 1) % 4;
        tmpPos = [pos[0] + step[current][0], pos[1] + step[current][1]]
        if (is_boardered(tmpPos[0], tmpPos[1]) && !visited[tmpPos[0]][tmpPos[1]]) {
            pos = tmpPos;
        } else {
            finish = true;
        }
    }

    function is_boardered(x: number, y: number) {
        return x < data.length && y < data[0].length && x >= 0 && y >= 0
    }

    return JSON.stringify(result);
}


export function SubarraywithMaximumSum(data: Array<number>): number {
    const prefixSum: Array<number> = new Array<number>(data.length).fill(0);
    prefixSum[0] = data[0];
    for (let i = 1; i < data.length; ++i) {
        prefixSum[i] = prefixSum[i - 1] + data[i];
    }

    let result = data[0];
    for (let i = 0; i < data.length; ++i) {
        for (let j = i; j < data.length; ++j) {
            const currentSum = i === 0 ? prefixSum[j] : prefixSum[j] - prefixSum[i - 1];
            result = Math.max(currentSum, result);
        }
    }

    return result;
}

function findLargestPrimeFactor(n: number): number {

    function isPrime(num: number): boolean {
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                return false;
            }
        }
        return num > 1;
    }
    let largestPrime: number = 1;

    for (let i = 2; i <= n; i++) {
        while (isPrime(i) && n % i === 0) {
            largestPrime = i;
            n /= i;
        }
    }

    return largestPrime;
}

export function UniquePathsinaGridII(grid: number[][]): number {
    const rows = grid.length;
    const cols = grid[0].length;

    if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) {
        return 0;
    }

    const dp: number[][] = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

    dp[0][0] = 1;

    for (let i = 1; i < rows; i++) {
        dp[i][0] = grid[i][0] === 0 ? dp[i - 1][0] : 0;
    }
    for (let j = 1; j < cols; j++) {
        dp[0][j] = grid[0][j] === 0 ? dp[0][j - 1] : 0;
    }

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            if (grid[i][j] === 0) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
    }

    return dp[rows - 1][cols - 1];
}

export function CompressionIILZDecompression(data: string): string {
    let result = "";
    let i = 0;

    while (i < data.length) {
        const length = parseInt(data[i]);
        i++;

        if (length === 0) continue; 

        if (i % 2 === 1) {
            result += data.substring(i, i + length);
            i += length;
        } else {
            const offset = parseInt(data[i]);
            i++;
            for (let j = 0; j < length; j++) {
                const charToCopy = result[result.length - offset];
                result += charToCopy;
            }
        }
    }

    return result;
}

export function ShortestPathInAGrid(ns: NS, data: number[][]): string {
    let rows = data.length;
    let columns = data[0].length;

    if (data[0][0] === 1 || data[rows-1][columns - 1] === 1) {
        return "";
    }

    const  moveMatrix = [[-1, 0], [0, 1], [0, -1], [1, 0]];
    const moveName: Map<number[], string> = new Map<number[], string>(
    [
        [[-1, 0], "D"],
        [[0, 1], "R"],
        [[0, -1], "L"],
        [[1, 0], "U"],
    ])

    const pathMatrix: string[][] = new Array(rows).fill(0).map(() => new Array(columns).fill(""));
    const stack: number[][] = new Array<Array<number>>();
    stack.push([0, 0]);

    while (stack.length != 0) {
        const current = stack[0];

        for (let move of moveMatrix) {
            let step = [current[0] + move[0], current[1] + move[1]];
            if (!CellExists(step[0], step[1])) {
                continue;
            }

            pathMatrix[step[0]][step[1]] = pathMatrix[current[0]][current[1]] + moveName.get(move);
            stack.push(move);
        }
        stack.shift();
    }

    function CellExists(y: number, x: number): boolean {
        return y >= 0 && y < rows && x >= 0 && x < columns && data[y][x] === 0 && pathMatrix[y][x] === "";
    }

    ns.tprint(pathMatrix);
    return pathMatrix[rows-1][columns-1];
}