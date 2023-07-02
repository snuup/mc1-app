import * as d3 from 'd3'
import { jsx } from '../jmx-lib/core'
import { m } from '../app/model'
import { FishNode } from '../analysis/fishnode'
import { mount } from '../utils/common'

const radius = 8
const width = 600
const height = 400

const xscaler = d3.scaleLinear([0, 100], [0, width])
const yscaler = d3.scaleLinear([0, 100], [0, height])

const randscale = d3.scaleLinear([0, 1], [0, 100])
function rand100() {
    return randscale(Math.random())
}

let simulation

function rund3(e: SVGElement) {

    console.log("patch network!")

    const svg1 = d3
        .select(e)
        //.attr('class', 'xy')
        .attr('viewBox', [0, 0, width, height])
        .style('width', width)
        .style('height', height)

    let links = m.netgraph.links

    const link = svg1
        .selectAll('.link')
        .data(links)
        .join(
            enter =>
                enter
                    .append('line')
                    .attr('class', 'link')
                    .attr('class', d => d.type)
                    .attr('stroke-width', 2)
                    .attr('fill', 'none'),
            //.attr('opacity', d => d.weight)
            //.on("click", e => c.selectlink(e.target.__data__)),
            update => update,

            exit => exit.remove()
        )

    let nodes = m.netgraph.nodes
    nodes.forEach(n => {
        let isinv = m.investigatees.includes(n.id)
        n.x = rand100()
        n.y = rand100()
        n.z = isinv ? 1 : 0
        n.isinv = isinv
        n.up = 0
    })

    let nodesxy = svg1
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('r', radius)
        .classed('inv', d => m.investigatees.includes(d.id))
        .classed('focused', d => m.graphfocusnode === d)

    // nodesxy.append('title').text(d => d.id)

    // let nodesxz = svg2
    //     .selectAll('circle')
    //     .data(nodes)
    //     .join('circle')
    //     .attr('r', radius)
    //     .classed('inv', d => m.investigatees.includes(d.id))
    //     .classed('focused', d => m.graphfocusnode === d)

    // nodesxz.append('title').text(d => d.id)

    // simulation = d3d
    //     .forceSimulation(nodes, 3)
    //     .stop()
    //     .force('link', d3d.forceLink(links).id((n: FishNode) => n.id))
    //     .force('collide', d3d.forceCollide().radius(radius).strength(0.03))
    //     .force('z', d3d.forceZ(100).strength(0.05))
    //     .force('up-force', forceup)
    //     .force('box', boxingForce)
    //     .force('inv', invForce)
    //     .on('tick', updateview)

    // function forceup(alpha) {
    //     for (let n of nodes.filter(n => n.up)) {
    //         n.vz += (0 - n.z) * n.up! * 0.2 * alpha
    //     }
    // }

    // function boxingForce(alpha) {
    //     for (let n of nodes) {
    //         n.x = n.x.clamp(0, 100)
    //         n.y = n.y.clamp(0, 100)
    //         n.z = n.z.clamp(0, 100)
    //     }
    // }

    // function invForce() {
    //     let [a, b, c, d] = m.investigatees.map(m.netgraph.getnode)
    //     a.x = 5
    //     b.x = 80
    //     c.x = 95
    //     d.x = 50
    //     a.y = 10
    //     b.y = 10
    //     c.y = 35
    //     d.y = 90
    //     a.z = 0
    //     b.z = 0
    //     c.z = 0
    //     d.z = 0
    // }

    // function updateview() {
    //     console.log('ontick')
    //     link.attr('x1', d => xscaler(d.source.x))
    //         .attr('y1', d => yscaler(d.source.y))
    //         .attr('x2', d => xscaler(d.target.x))
    //         .attr('y2', d => yscaler(d.target.y))
    //         .style('opacity', d => opacityscaler(d.maxz))

    //         nodesxy
    //         .attr('cx', d => xscaler(d.x))
    //         .attr('cy', d => yscaler(d.y))
    //         .style('opacity', d => opacityscaler(d.z))

    //     nodesxz
    //         .attr('cx', d => xscaler(d.x))
    //         .attr('cy', d => zscaler(d.z))
    //         .style('opacity', d => 1 - opacityscaler(d.y))
    // }

    // mount({ simulation })
}

export const Network = () => {
    return <div class='network'  >
        <svg patch={rund3}></svg>
    </div>
}

// function reheat() {
//     simulation.alpha(0.5)
//     simulation.restart()
// }

// mount({ opacityscaler, zscaler, reheat })
