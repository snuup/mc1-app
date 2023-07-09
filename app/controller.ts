import * as d3 from "d3"
import { initrouter } from "../jmx-lib/router"
import { updateview, updateviewmany } from "../jmx-lib/core"
import { mc1 } from "../data/data"
import { mount, rebind } from "../utils/common"
import { mraw as m } from "./model"
import { Graph, GraphAlgos } from "../elements/graph"
import { FishNode } from "../elements/fishnode"
import { FishLink } from "../elements/fishlink"
import { Url } from "./routes"
import { Path, PathMatrixBuilder } from "../elements/path"
import { Paths } from "../comp/pathmatrix"
import { SuperLink } from "../elements/superlink"
import { issuspicious } from "../analysis/common"


export class Controller {

    constructor() {
        rebind(this)
        this.prepareData()
        initrouter(this.setroute)
    }

    prepareData() {

        let nodes: FishNode[] = mc1.nodes.map(FishNode.createFromOriginal)
        let links: FishLink[] = mc1.links.map(FishLink.createFromOriginal)
        let g = m.graph = new Graph(nodes, links)
        g.nodes.forEach(n => {
            let counts = g.getlinks(n.id).countBy(dl => dl.rev.toString())
            n.outdegree = counts.false ?? 0
            n.indegree = counts.true ?? 0
        })

        mount({ links })

        let superlinks = links.groupBy(l => l.ukey).entries.map(([_, ls]) => new SuperLink(ls))
        m.supergraph = new Graph(nodes, superlinks)

        m.invs = m.investigatees.map(m.graph.getnode)
        m.suspects = m.graph.nodes.filter(n => issuspicious(n.id))

        this.restore()
        this.computepathmatrix()
        this.updatenetgraph()

        // init country color scaler
        //let allcountries = nodes.map(n => n.country).distinctBy().map(s => s ?? "undefined")
        m.countryColorScaler = d3.scaleOrdinal(d3.schemeAccent) // d3.scaleOrdinal().domain(allcountries)
    }

    // getsubgraph(nodes: FishNode[]) {
    //     nodes.flatMap(n => n.outlinks)
    //     let links1 = nodes.flatMap(n => n.outlinks).filter(l => l)
    //     let nodes1 = links1.map(l => l.tid).map(m.graph.getnode)
    //     return new Graph(nodes.concat(nodes1).distinctBy(), links1)
    // }

    setroute() {
        m.url = decodeURI(document.location.pathname).split('/').slice(1) as Url
        console.log("setroute", m.url)

        switch (m.url[0]) {
            // case "network":
            //     this.setfocus(m.url[1])
            //     break
        }

        updateview('#main', false, true)
    }


    // floodsea(levels = 3) {
    //     let g = m.seagraph = this.getsubgraph(m.investigatees.map(m.graph.getnode))
    //     g.nodes.forEach(n => n.up = 0)
    //     let fronteer = m.investigatees.map(g.getnode)
    //     fronteer.forEach(n => n.up = 0.1)
    //     let visited = [] as FishNode[]

    //     function getnode(nid) {
    //         let n = g.getnode(nid)
    //         if (!n) {
    //             n = FishNode.clone(m.graph.getnode(nid))
    //             g.addnode(n)
    //         }
    //         return n
    //     }

    //     function floodfronteer(level) {
    //         console.log("floodfronteer", level)

    //         let nextfronteer: FishNode[] = []

    //         console.log("tbd")

    //         //     fronteer.forEach(n => {
    //         //         if (visited.includes(n)) return
    //         //         visited.push(n)

    //         //         n.outlinks.forEach(l => {

    //         //             // let x
    //         //             // if (typeof l.target === "string") x = getnode(l.target)
    //         //             // if (x == undefined) debugger

    //         //             if (typeof l.target === undefined) debugger
    //         //             if (typeof l.target === "string") l.target = getnode(l.target)

    //         //             l.target.up += n.up! * l.weight
    //         //             if (isNaN(l.target.up)) debugger
    //         //             //console.log("", l.target.up, n.up, l.weight)
    //         //         })
    //         //         nextfronteer.push(...n.outlinks?.map(l => l.target) ?? [])
    //         //         nextfronteer = nextfronteer.distinctBy()

    //         //         fronteer = nextfronteer

    //         //         let illegals = fronteer.filter(n => n.id.includes("llegal"))
    //         //         console.log(illegals.map(n => n.id).join(" + "))

    //         //         // console.log("fronteer", fronteer)
    //         //     })
    //         // }
    //         // for (let i = 1; i <= levels; i++) {
    //         //     floodfronteer(i)
    //     }
    // }

    togglenetnode(ev, n: FishNode) {
        let add = m.pinnednodes.toggle(n)
        //m.netgraph.togglenode(n, add) // ... create new graph class ? add node, compute path matrix

        this.computepathmatrix()
        this.updatenetgraph()

        let currentkeys = m.pathmatrix.map(ps => ps.key)
        m.pinnedpaths.forEach(k => { if (!currentkeys.includes(k)) m.pinnedpaths.remove(k) })

        updateviewmany(ev.currentTarget, ".network") // ".net-graph > svg", ".path-matrix")
        //updateview(".network")
        this.store()
    }


    // removepinnednode(n: FishNode) {
    //     let add = m.pinnednodes.toggle(n)
    //     //m.netgraph.togglenode(n, add) // ... create new graph class ? add node, compute path matrix

    //     this.computepathmatrix()
    //     this.updatenetgraph()

    //     let currentkeys = m.pathmatrix.map(ps => ps.key)
    //     m.pinnedpaths.forEach(k => { if (!currentkeys.includes(k)) m.pinnedpaths.remove(k) })

    //     updateviewmany(ev.currentTarget, ".net-graph > svg")
    //     this.store()
    // }

    togglepaths(nps: Paths) {
        m.pinnedpaths.toggle(nps.key)
        this.updatenetgraph()
        updateview('.path-matrix')
        updateview('.net-graph > svg')
        this.store()
    }

    updatenetgraph() {
        let ps = m.pathmatrix.filter(ps => m.pinnedpaths.includes(ps.key))
        let links = ps.flatMap(p => p.ps).flatMap(p => p.links).map(dl => dl.link).distinctBy()
        let nodes = links.flatMap(l => l.nodeids.map(nid => m.graph.getnode(nid))).concat(m.pinnednodes).distinctBy()
        m.netgraph.nodes = nodes
        m.netgraph.links = links
        m.netgraph.fixupnodemap()
    }

    computepathmatrix() {

        //console.log("computepathmatrix")

        let nodes = m.pinnednodes
        let n = nodes.length
        let indexes = d3.range(n).flatMap(x => d3.range(x).map(y => [x, y]))

        function computepaths(i): Path<SuperLink>[] {
            let { goalpaths } = GraphAlgos.findpathsmulti(m.supergraph.getlinks, nodes[i].id, nodes.slice(i + 1).map(n => n.id))
            return goalpaths
        }

        let allpaths = d3.range(n).flatMap(computepaths)
        //console.log("allpaths", allpaths)
        mount({ allpaths })

        function getpaths(i: number, j: number): Paths {
            let n1 = nodes[i]
            let n2 = nodes[j]
            let ps = allpaths.filter(p => p.start == n2.id && p.end == n1.id)
            return new Paths(ps, i, j, n1, n2)
        }

        m.pathmatrix = indexes.map(([i, j]) => getpaths(i, j))
    }

    highlightbadpaths(n: FishNode) {
        console.log("highlightbadpaths", n)

        this.resethighlights()

        n.focused = true

        document.body.classList.add("highlightpaths")
        let bads = m.netgraph.nodes.filter(n => m.suspects.includes(n)).map(n => n.id)
        let { goalpaths } = GraphAlgos.findpathsmulti(m.supergraph.getlinks, n.id, bads, 3, ['FishEye International'])
        console.log("goalpaths", goalpaths)
        mount({ goalpaths })

        let highlightlinks = goalpaths.flat().flatMap(p => p.links).map(dl => dl.link).distinctBy()
        highlightlinks.forEach(l => l.highlight = true)
        console.log("highlighted links:", highlightlinks)

        let highlightnodes = highlightlinks.flatMap(l => l.nodeids).distinctBy()
        m.netgraph.nodes.forEach(n => n.highlight = highlightnodes.includes(n.id))

        console.log("highlightlinks", highlightlinks)
        console.log("highlightnodes", highlightnodes)

        console.log("highs-focs:", m.netgraph.nodes.map(n => `${n.highlight} - ${n.focused}`).join(' '))

        this.storenetgraph()
        updateview('.net-graph > svg')
    }

    resethighlights() {
        console.log("resethighlights")

        m.netgraph.links.forEach(l => l.highlight = false)
        m.netgraph.nodes.forEach(n => {
            n.focused = false
            n.highlight = false
        })
        this.storenetgraph()

        this.printhfs(1)

        document.body.classList.remove("highlightpaths")
        updateview('.net-graph > svg')

        this.printhfs(2)
    }

    store() {
        localStorage.setItem("session", JSON.stringify({
            pinnednodes: m.pinnednodes.map(n => n.id),
            pinnedpaths: m.pinnedpaths
        }))
    }

    restore() {
        let json = localStorage.getItem("session")
        if (!json) return
        let o = JSON.parse(json)
        m.pinnednodes = o.pinnednodes.map(nid => m.graph.getnode(nid))
        m.pinnedpaths = o.pinnedpaths
    }

    storenetgraph() {
        localStorage.setItem("netgraph", JSON.stringify(m.netgraph.nodes))
        console.log("stored")
        this.printhfs()
    }

    restorenetgraph() {
        let json = localStorage.getItem("netgraph")
        if (!json) return
        let ns = JSON.parse(json)
        ns.forEach(n => n.donut = m.graph.getnode(n.id).donut) // fixup
        let nodemap = new Map(ns.map(n => [n.id, n]))
        m.netgraph.nodes.forEach(n => Object.assign(n, nodemap.get(n.id)))
        console.log("restored")
        this.printhfs()
    }

    printhfs(msg?) {
        // console.log("printhfs", msg)
        // for (let n of m.netgraph.nodes) {
        //     if (n.highlight) console.log("high", n.id)
        //     if (n.focused) console.log("focs", n.id)
        // }
    }
}

export let c = new Controller()

mount({ c })

// make a copy of node for force
// make a link of node for force