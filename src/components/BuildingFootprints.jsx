import { useMemo } from 'react';
import { getDefaultFactoryLayout, getFactoryLayouts } from '../factoryLayout';

export default function BuildingFootprints({ factory, layout: requestedLayout, machineCount }) {
    const layouts = useMemo(
        () => getFactoryLayouts({ factory, machineCount }),
        [factory, machineCount],
    );
    const defaultLayout = useMemo(() => getDefaultFactoryLayout(layouts), [layouts]);
    const layout = requestedLayout ?? defaultLayout;
    const buildings = Array.from(
        { length: layout.machineCount },
        (_, index) => index,
    );

    return (
        <div
            className="factories"
            data-rotated={layout.rotated}
            style={{
                '--factory-columns': layout.columns,
                '--factory-width': `${layout.factoryWidth}px`,
                '--factory-height': `${layout.factoryHeight}px`,
                '--factory-body-width': `${layouts[0].factoryWidth}px`,
                '--factory-body-height': `${layouts[0].factoryHeight}px`,
            }}
        >
            {buildings.map((building) => (
                <div className="factory-slot" key={building}>
                    <div className="factory" />
                </div>
            ))}
        </div>
    );
}
