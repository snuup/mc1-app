import * as d3 from "d3"
import { FishLink } from "../elements/fishlink"
import { LinkController } from "./linkcontroller"
import { m } from "../app/model"
import { mount } from "../utils/common"
import { jsx } from "../jmx-lib/core"
import { getconnects, getlinkgroupkey, linktypes, nodetypes } from "../analysis/common"

export type Matrix<T> = {
    [columns: string]: {
        [rows: string]: T
    }
}

export const LinkStatsForType = ({ c, type }: { c: LinkController, type: LinkType }) => {

    function rund3(tableDom: HTMLTableElement) {

        console.log("path link-stats-table!")

        let lg = m.linkgroups[type]
        let max = lg.values.map(ls => ls.length).max()
        let opacityScaler = d3.scalePow([0, max], [0, 1])

        let table = d3.select(tableDom)
        let thead = table.append("thead")
        let tbody = table.append("tbody")

        // header row
        thead
            .append('tr')
            .selectAll('th')
            .data([".", ...nodetypes])
            .join('th')
            .text(d => d)
            .attr("class", d => d)

        let rows =
            tbody
                .selectAll('tr')
                .data(nodetypes)
                .join('tr')
                .attr('linktype', d => d)

        rows
            .append('th')
            .text(d => d)
            .attr("class", d => d)

        // let out = d3.select(tableout).on('click', () => setout([]))

        let setout = (links: any[]) => {

            throw "tbd"

            // tableout.replaceChildren()

            // let rows =
            //     d3.select(tableout)
            //         .on('click', () => setout([]))
            //         .selectAll('tr')
            //         .data(links.sortBy(l => -l.weight))
            //         .join('tr')

            // rows.append('td').attr("class", d => linktypetext(m.graph.getnode(d.source).type)).text(d => d.source)
            // rows.append('td').attr("class", d => linktypetext(m.graph.getnode(d.target).type)).text(d => d.target)
            // rows.append('td').text(d => d.weight.toFixed(4))
        }

        rows
            .selectAll('td')
            .data(st => nodetypes.map(tt => {
                return ({ st, tt, length: lg[getlinkgroupkey(st, tt)]?.length ?? 0 })
            }))
            .join('td')
            .attr('connects', getconnects)
            //.on('mouseenter', (_, d) => c.select(d.connects))
            //.on('mouseout', (_, d) => c.deselect())
            .style("background", ({length}) => `rgba(170, 204, 187, ${opacityScaler(length)})`)
            .text(d => d?.length)
    }

    let tableout

    function onmount(e: HTMLElement) {

        function select(connects: string, force: boolean) {
            //console.log("select linkstat!")
            let td = e.querySelector(`[connects=${connects}]`)
            td?.classList.toggle("sel", force)
            // td.style.backgroundImage = `linear-gradient(to bottom left, ${targetcolor} 50%, ${sourcecolor} 50%)`
        }

        c.register(e, select)
    }

    return (
        <div mounted={onmount}>
            <table class="link-stats-table" patch={rund3} />
            <table class="out" mounted={e => tableout = e} />
        </div>)
}