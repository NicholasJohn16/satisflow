import { useEffect, useId, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useReactFlow } from '@xyflow/react';
import { useData } from '../contexts/data';
import { useModal } from '../contexts/modal';
import { humanize } from '../humanize';
import {
    getClockSpeedForResourceOutput,
    getResourceNodeData,
    RESOURCE_NODE_EXTRACTORS,
    RESOURCE_NODE_MINERS,
    RESOURCE_NODE_QUALITIES,
    RESOURCE_NODE_RESOURCES,
} from '../resourceNodes';
import ItemImage from './ItemImage';

/* eslint-disable react/prop-types */

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '.5rem',
        minWidth: '22rem',
    },
};

function ResourceSelect({ items, onChange, options, value }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(() => (
        Math.max(options.indexOf(value), 0)
    ));
    const containerRef = useRef(null);
    const optionRefs = useRef([]);
    const triggerRef = useRef(null);
    const labelId = useId();
    const listboxId = useId();
    const valueId = useId();
    const selectedIndex = Math.max(options.indexOf(value), 0);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            optionRefs.current[activeIndex]?.focus();
        }
    }, [activeIndex, isOpen]);

    const openDropdown = (index = selectedIndex) => {
        setActiveIndex(index);
        setIsOpen(true);
    };

    const closeDropdown = ({ restoreFocus = false } = {}) => {
        setIsOpen(false);
        if (restoreFocus) {
            triggerRef.current?.focus();
        }
    };

    const selectResource = (resourceId) => {
        onChange(resourceId);
        closeDropdown({ restoreFocus: true });
    };

    const moveActiveOption = (offset) => {
        setActiveIndex((currentIndex) => (
            (currentIndex + offset + options.length) % options.length
        ));
    };

    const handleTriggerKeyDown = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const offset = event.key === 'ArrowDown' ? 1 : -1;
            openDropdown((selectedIndex + offset + options.length) % options.length);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDropdown();
        }
    };

    const handleOptionKeyDown = (event, resourceId) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectResource(resourceId);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeDropdown({ restoreFocus: true });
        } else if (event.key === 'Tab') {
            closeDropdown();
        }
    };

    return (
        <div className="resource-node-modal__field" ref={containerRef}>
            <span id={labelId}>Raw resource</span>
            <div className="resource-select">
                <button
                    aria-controls={listboxId}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-labelledby={`${labelId} ${valueId}`}
                    className="resource-select__trigger"
                    onClick={() => (isOpen ? closeDropdown() : openDropdown())}
                    onKeyDown={handleTriggerKeyDown}
                    ref={triggerRef}
                    type="button"
                >
                    <ItemImage item={value} />
                    <span id={valueId}>{items[value]?.displayName ?? value}</span>
                    <span aria-hidden="true" className="resource-select__chevron" />
                </button>
                {isOpen && (
                    <div
                        aria-labelledby={labelId}
                        className="resource-select__options"
                        id={listboxId}
                        role="listbox"
                    >
                        {options.map((resourceId, index) => (
                            <button
                                aria-selected={resourceId === value}
                                className="resource-select__option"
                                key={resourceId}
                                onClick={() => selectResource(resourceId)}
                                onFocus={() => setActiveIndex(index)}
                                onKeyDown={(event) => handleOptionKeyDown(event, resourceId)}
                                ref={(element) => { optionRefs.current[index] = element; }}
                                role="option"
                                tabIndex={index === activeIndex ? 0 : -1}
                                type="button"
                            >
                                <ItemImage item={resourceId} />
                                <span>{items[resourceId]?.displayName ?? resourceId}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResourceNodeModal() {
    const {
        closeModal,
        isOpen,
        node,
        resourceNodeIsNew,
        setNode,
    } = useModal();
    const { items } = useData();
    const { setEdges, setNodes, updateNodeData } = useReactFlow();
    const [resource, setResource] = useState(node.data.resource);
    const [quality, setQuality] = useState(node.data.quality);
    const [minerTier, setMinerTier] = useState(
        node.data.minerTier === 'well' || node.data.minerTier === 'water'
            ? '3'
            : node.data.minerTier ?? '3',
    );
    const [machineCount, setMachineCount] = useState(node.data.machineCount ?? 1);
    const [clockPercent, setClockPercent] = useState(
        (node.data.clockSpeed ?? 1) * 100,
    );
    const [outputAmount, setOutputAmount] = useState(
        node.data.products?.[node.data.resource] ?? 0,
    );
    const isActualGas = items[resource]?.form === 'gas';
    const isWater = resource === 'Desc_Water_C';
    const isOil = resource === 'Desc_LiquidOil_C';
    const isFluid = isActualGas || isWater || isOil;
    const baseData = getResourceNodeData(resource, quality, {
        clockSpeed: 1,
        machineCount,
        minerTier,
    });
    const baseAmount = baseData.products[baseData.resource];
    const maximumAmount = baseAmount * 2.5;
    const nextData = {
        ...getResourceNodeData(resource, quality, {
            clockSpeed: Number(clockPercent) / 100,
            machineCount,
            minerTier,
        }),
        connectorLayout: node.data.connectorLayout ?? 'vertical',
        layoutLocked: node.data.layoutLocked === true,
    };
    const amount = nextData.products[nextData.resource];
    const extractor = RESOURCE_NODE_EXTRACTORS[nextData.minerTier];
    const roundAmount = (value) => Math.round(value * 1e10) / 1e10;

    const applyClockToBaseAmount = (nextBaseAmount) => {
        const clockSpeed = Math.min(
            Math.max(Number(clockPercent) / 100 || 0.01, 0.01),
            2.5,
        );

        setClockPercent(roundAmount(clockSpeed * 100));
        setOutputAmount(roundAmount(nextBaseAmount * clockSpeed));
    };

    const changeResource = (nextResource) => {
        const nextBaseData = getResourceNodeData(nextResource, quality, {
            clockSpeed: 1,
            machineCount,
            minerTier,
        });

        setResource(nextResource);
        applyClockToBaseAmount(nextBaseData.products[nextBaseData.resource]);
    };

    const changeQuality = (nextQuality) => {
        const nextBaseData = getResourceNodeData(resource, nextQuality, {
            clockSpeed: 1,
            machineCount,
            minerTier,
        });

        setQuality(nextQuality);
        applyClockToBaseAmount(nextBaseData.products[nextBaseData.resource]);
    };

    const changeMinerTier = (nextMinerTier) => {
        const nextBaseData = getResourceNodeData(resource, quality, {
            clockSpeed: 1,
            machineCount,
            minerTier: nextMinerTier,
        });

        setMinerTier(nextMinerTier);
        applyClockToBaseAmount(nextBaseData.products[nextBaseData.resource]);
    };

    const changeMachineCount = (value) => {
        const nextBaseData = getResourceNodeData(resource, quality, {
            clockSpeed: 1,
            machineCount: value,
            minerTier,
        });
        const clockSpeed = Math.min(
            Math.max(Number(clockPercent) / 100 || 0.01, 0.01),
            2.5,
        );

        setMachineCount(value);
        setOutputAmount(roundAmount(
            nextBaseData.products[nextBaseData.resource] * clockSpeed,
        ));
    };

    const normalizeMachineCount = () => {
        setMachineCount(nextData.machineCount);
    };

    const changeClockPercent = (value) => {
        if (value === '') {
            setClockPercent(value);
            return;
        }

        if (Number.isFinite(Number(value))) {
            const cappedPercent = Math.min(Number(value), 250);
            const clockSpeed = Math.min(Math.max(cappedPercent / 100, 0.01), 2.5);

            setClockPercent(cappedPercent);
            setOutputAmount(roundAmount(baseAmount * clockSpeed));
        }
    };

    const changeOutputAmount = (value) => {
        if (value === '') {
            setOutputAmount(value);
            return;
        }

        if (Number.isFinite(Number(value))) {
            const cappedAmount = Math.min(Number(value), maximumAmount);
            const clockSpeed = getClockSpeedForResourceOutput(cappedAmount, baseAmount);

            setOutputAmount(cappedAmount);
            setClockPercent(roundAmount(clockSpeed * 100));
        }
    };

    const normalizeClockPercent = () => {
        const clockSpeed = Math.min(Math.max(Number(clockPercent) / 100 || 0.01, 0.01), 2.5);

        setClockPercent(roundAmount(clockSpeed * 100));
        setOutputAmount(roundAmount(baseAmount * clockSpeed));
    };

    const normalizeOutputAmount = () => {
        const clockSpeed = getClockSpeedForResourceOutput(outputAmount, baseAmount);

        setClockPercent(roundAmount(clockSpeed * 100));
        setOutputAmount(roundAmount(baseAmount * clockSpeed));
    };

    const saveAndClose = () => {
        if (resource !== node.data.resource) {
            setEdges((edges) => edges.filter((edge) => edge.source !== node.id));
        }
        updateNodeData(node.id, nextData, { replace: true });
        setNode(null);
        closeModal();
    };

    const cancelAndClose = () => {
        if (resourceNodeIsNew) {
            setEdges((edges) => edges.filter((edge) => (
                edge.source !== node.id && edge.target !== node.id
            )));
            setNodes((nodes) => nodes.filter((candidate) => candidate.id !== node.id));
        }
        setNode(null);
        closeModal();
    };

    return (
        <Modal
            isOpen={isOpen.resourceNode}
            onRequestClose={cancelAndClose}
            style={customStyles}
        >
            <h2>{resourceNodeIsNew ? 'Add Resource Node' : 'Edit Resource Node'}</h2>
            <div className="resource-node-modal__preview">
                <img
                    alt={extractor.label}
                    className="resource-node-modal__extractor-image no-drag"
                    draggable="false"
                    src={extractor.image}
                />
                <div>
                    <strong>{extractor.label}</strong>
                    <span>
                        {amount.toLocaleString()} {isFluid ? 'm³ ' : ''}
                        {items[resource]?.displayName} per minute
                    </span>
                    <span>Power: {humanize(nextData.energyUsage)} MW</span>
                </div>
            </div>
            <ResourceSelect
                items={items}
                onChange={changeResource}
                options={RESOURCE_NODE_RESOURCES}
                value={resource}
            />
            <label className="resource-node-modal__field">
                <span>{isWater ? 'Water source' : 'Node quality'}</span>
                <select
                    disabled={isWater}
                    value={isWater ? 'surface' : quality}
                    onChange={(event) => changeQuality(event.target.value)}
                >
                    {isWater && <option value="surface">Surface water</option>}
                    {!isWater && Object.entries(RESOURCE_NODE_QUALITIES).map(([qualityId, option]) => (
                        <option value={qualityId} key={qualityId}>{option.label}</option>
                    ))}
                </select>
            </label>
            <label className="resource-node-modal__field">
                <span>Extractor</span>
                <select
                    disabled={isActualGas || isWater || isOil}
                    value={isWater ? 'water' : isActualGas ? 'well' : isOil ? 'oil' : minerTier}
                    onChange={(event) => changeMinerTier(event.target.value)}
                >
                    {isActualGas && <option value="well">Resource Well Pressurizer</option>}
                    {isWater && <option value="water">Water Extractor</option>}
                    {isOil && <option value="oil">Oil Extractor</option>}
                    {!isActualGas && !isWater && !isOil && Object.entries(RESOURCE_NODE_MINERS).map(([tier, miner]) => (
                        <option value={tier} key={tier}>{miner.label}</option>
                    ))}
                </select>
            </label>
            <label className="resource-node-modal__field">
                <span>{isActualGas || isWater || isOil ? 'Number of extractors' : 'Number of miners'}</span>
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={machineCount}
                    onChange={(event) => changeMachineCount(event.target.value)}
                    onBlur={normalizeMachineCount}
                />
            </label>
            <label className="resource-node-modal__field">
                <span>Clock speed</span>
                <div className="resource-node-modal__clock">
                    <input
                        type="number"
                        min="1"
                        max="250"
                        value={clockPercent}
                        onChange={(event) => changeClockPercent(event.target.value)}
                        onBlur={normalizeClockPercent}
                    />
                    <span>%</span>
                </div>
            </label>
            <label className="resource-node-modal__field">
                <span>Output per minute</span>
                <div className="resource-node-modal__clock">
                    <input
                        type="number"
                        min={baseAmount * 0.01}
                        max={maximumAmount}
                        step="any"
                        value={outputAmount}
                        onChange={(event) => changeOutputAmount(event.target.value)}
                        onBlur={normalizeOutputAmount}
                    />
                    <span>{isFluid ? 'm³' : 'units'}</span>
                </div>
            </label>
            <p className="resource-node-modal__note">
                {isWater
                    ? 'Water output uses a Water Extractor.'
                    : isActualGas
                    ? 'Gas output uses a Resource Well Pressurizer.'
                    : isOil
                    ? 'Crude Oil output uses an Oil Extractor.'
                    : 'Miner output is multiplied by tier, purity, and clock speed.'}
            </p>
            <button className="default" onClick={saveAndClose}>Save</button>
        </Modal>
    );
}
