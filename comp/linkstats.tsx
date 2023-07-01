import { jsx } from "../jmx-lib/core"
import * as d3 from "d3"
import { FishLink } from "../analysis/fishlink"
import { ChordForType } from "./chord"
import { SankeyForType } from "./sankey"
import { mount } from "../utils/common"

export type Matrix<T> = {
    [columns: string]: {
        [rows: string]: T
    }
}

const LinkStatsForType = ({ links }: { links: FishLink[] }) => {

    function rund3(tableDom: HTMLTableElement) {

        let sourcetypes = links.map(l => l.target.type).distinctBy()
        let targettypes = links.map(l => l.target.type).distinctBy()
        let linksbysource = links.groupBy(l => l.source.type)
        let matrix: Matrix<any> = linksbysource.mapValues(links => links.groupBy(l => l.target.type))
        let alltypes = sourcetypes.concat(targettypes).distinctBy().sort() as string[]
        const linktypetext = d => (d?.toString() ?? "undefined")
        const linktypetextcut = d => linktypetext(d).slice(0, 10)

        mount({ matrix })

        let table = d3.select(tableDom)
        let thead = table.append("thead")
        let tbody = table.append("tbody")

        // header row
        thead
            .append('tr')
            .selectAll('th')
            .data([".", ...alltypes])
            .join('th')
            .text(linktypetextcut)
            .attr("class", linktypetext)

        let rows =
            tbody
                .selectAll('tr')
                .data(alltypes)
                .join('tr')

        rows
            .append('th')
            .text(linktypetextcut)
            .attr("class", linktypetext)

        // let out = d3.select(tableout).on('click', () => setout([]))

        let setout = (links: any[]) => {

            console.log("clücks", links)

            let rows =
                d3.select(tableout)
                    .on('click', () => setout([]))
                    .selectAll('tr')
                    .data(links)
                    .join('tr')

            rows.selectAll('td')
                //.data(d => [d.sid, d.tid, linktypetext(d.source.type), linktypetext(d.target.type)])
                .data(d => [d.source, d.target])
                .join('td')
                .attr("class", d => d.type)
                .text(d => d.id)
        }

        rows
            .selectAll('td')
            .data(st => alltypes.map(tt => [st, tt]))
            .join('td')
            .text(([st, tt]) => matrix[st][tt]?.length)
            .on('click', (_, [st, tt]) => setout(matrix[st][tt]))
    }

    let tableout

    return (
        <div>
            <table class="link-stats-table" patch={rund3} />
            <table class="out" mounted={e => tableout = e} />
        </div>)
}

export const LinkStats = ({ links }: { links: FishLink[] }) => {
    console.log("linkstats", links)
    return (
        <div class="linkstats">
            <h2>link stats</h2>
            {
                links.groupBy(l => l.type).entries.map(([type, links]) => (
                    <div >
                        <h3 class={type}>{type}</h3>
                        <div class="flexy">
                            <LinkStatsForType links={links} />
                            <SankeyForType links={links} />
                        </div>
                    </div>
                ))
            }
        </div>)
}