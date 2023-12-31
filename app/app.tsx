import { patch, jsx, When, updateview } from "../jmx-lib/core"
import { mc1 } from '../data/data'
import '../utils/common'
import { NodeStats } from '../nodestats/nodestats'
import { m } from './model'
import { Link } from './routes'
import { cc, mount } from '../utils/common'
import { NetworkView } from "../networkview/networkview"
import { LinkStats } from "../linkstats/linkstats"
import { GraphStats } from "../graphstats/graphstats"

//let App = () => <body><NodeIdBarChart /></body>

mount({ mc1 })

let App = () => {
    return (
        <body class={cc(m.url)}>
            <header>
                <h2>FishEye MC1</h2>
                <Link url={['nodestats']} />
                <Link url={['linkstats']} />
                <Link url={['graphstats']} />
                <Link url={['network']} />
                <div id="mtoggle">
                    <input id="showmatrix" type="checkbox" onchange={() => document.body.classList.toggle("showmatrix")} />
                    <label for="showmatrix">show matrix</label>
                </div>
            </header>

            <article id='main' class={m.url[1]}>
                <When cond={m.url[1] == 'nodestats' || m.url[1] as unknown == ''}>
                    <NodeStats />
                </When>
                <When cond={m.url[1] == 'linkstats'}>
                    <LinkStats links={m.graph.links} />
                </When>
                <When cond={m.url[1] == 'graphstats'}>
                    <GraphStats links={m.graph.links} />
                </When>
                <When cond={m.url[1] == 'network'}>
                    <NetworkView />
                </When>
            </article>

            {/* <footer>footer</footer> */}

        </body>
    )
}

patch(document.body, <App />)

mount({ m, mc1, updateview })
