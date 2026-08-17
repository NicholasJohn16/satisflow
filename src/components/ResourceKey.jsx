import { useMemo, useState } from 'react';
import { useData } from '../contexts/data';
import { getResourceSummary } from '../resourceConnections';
import ItemImage from './ItemImage';

const formatAmount = (amount) => amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
});

function ResourceList({items, totals}) {
    const resources = [...totals.entries()].sort(([resourceA], [resourceB]) => (
        (items[resourceA]?.displayName ?? resourceA).localeCompare(
            items[resourceB]?.displayName ?? resourceB,
        )
    ));

    if (!resources.length) {
        return <div className="resource-key__empty">None</div>;
    }

    return resources.map(([resource, amount]) => (
        <div className="resource-key__resource" key={resource}>
            <ItemImage item={resource} />
            <span className="resource-key__name">
                {items[resource]?.displayName ?? resource}
            </span>
            <span className="resource-key__amount">{formatAmount(amount)}</span>
        </div>
    ));
}

export default function ResourceKey({nodes, edges}) {
    const { items } = useData();
    const [showAll, setShowAll] = useState(false);
    const {
        consumed,
        inputs,
        outputs,
        powerConsumed,
        powerProduced,
        produced,
    } = useMemo(
        () => getResourceSummary(nodes, edges),
        [edges, nodes],
    );
    const inputTotals = showAll ? consumed : inputs;
    const outputTotals = showAll ? produced : outputs;

    return (
        <div className="resource-key nodrag nopan">
            <div className="resource-key__title">
                <div>Flow totals <span>per minute</span></div>
                <button
                    type="button"
                    className="resource-key__toggle"
                    aria-pressed={showAll}
                    onClick={() => setShowAll((current) => !current)}
                >
                    {showAll ? 'Show net' : 'Show all'}
                </button>
            </div>
            <section>
                <h4>{showAll ? 'Total consumed' : 'Inputs needed'}</h4>
                <ResourceList items={items} totals={inputTotals} />
            </section>
            <section>
                <h4>{showAll ? 'Total produced' : 'Final outputs'}</h4>
                <ResourceList items={items} totals={outputTotals} />
            </section>
            <section>
                <h4>Power</h4>
                <div className="resource-key__power">
                    <span>Consumed</span>
                    <strong>{formatAmount(powerConsumed)} MW</strong>
                </div>
                <div className="resource-key__power">
                    <span>Produced</span>
                    <strong>{formatAmount(powerProduced)} MW</strong>
                </div>
            </section>
        </div>
    );
}
