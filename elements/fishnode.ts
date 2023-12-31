import { mount } from "../utils/common"
import { cleanid } from "../analysis/common"

export class FishNode implements INode {

    original: MC1Node
    id: string

    // highlight = false
    // focused = false

    selected = false
    pinned = false

    role: "inv" | "sus" | "inter" | undefined

    suspectdistance: number | undefined

    xgreed: number | undefined = undefined
    ygreed: number | undefined = undefined

    constructor(original: MC1Node) {
        this.original = original
        this.id = cleanid(original.id)
    }

    get inv() { return this.role == "inv" }
    get sus() { return this.role == "sus" }
    get inter() { return this.role == "inter" }

    get donut(): NodeLinkData[] { return this.original.donut }
    get outdegree(): number { return this.donut.sumBy(nd => nd.outs) }
    get indegree(): number { return this.donut.sumBy(nd => nd.ins) }
    get type(): NodeType | undefined { return this.original.type }
    get country() { return this.original.country }
    get id10() { return this.id.truncate(10) }
    get degree() { return this.outdegree + this.indegree }
}

export type FishNodeForce = FishNode & { x: number, y: number, vx: number, vy: number, fx?: number, fy?: number }

mount({ FishNode })