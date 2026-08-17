import { useState } from 'react';
import Modal from 'react-modal';
import { useReactFlow } from '@xyflow/react';
import { useModal } from '../contexts/modal';
import {
    getClockSpeedForPowerPlantFuel,
    getPowerPlantData,
    getPowerPlantFuelIds,
    POWER_PLANTS,
} from '../powerPlants';
import ItemImage from './ItemImage';

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

export default function PowerPlantModal() {
    const {
        closeModal,
        isOpen,
        node,
        powerPlantNodeIsNew,
        setNode,
    } = useModal();
    const { setEdges, setNodes, updateNodeData } = useReactFlow();
    const [plantType, setPlantType] = useState(node.data.plantType ?? 'coal');
    const [fuel, setFuel] = useState(node.data.fuel);
    const [machineCount, setMachineCount] = useState(node.data.machineCount ?? 1);
    const [clockPercent, setClockPercent] = useState(
        (node.data.clockSpeed ?? 1) * 100,
    );
    const plant = POWER_PLANTS[plantType];
    const fuelIds = getPowerPlantFuelIds(plantType);
    const selectedFuel = plant.fuels[fuel] ?? plant.fuels[fuelIds[0]];
    const [fuelAmount, setFuelAmount] = useState(
        node.data.ingredients?.[selectedFuel.resource] ?? selectedFuel.amount,
    );
    const baseData = getPowerPlantData(plantType, fuel, {
        clockSpeed: 1,
        machineCount,
    });
    const baseFuelAmount = baseData.ingredients[selectedFuel.resource];
    const maximumFuelAmount = baseFuelAmount * 2.5;
    const nextData = {
        ...getPowerPlantData(plantType, fuel, {
            clockSpeed: Number(clockPercent) / 100,
            machineCount,
        }),
        connectorLayout: node.data.connectorLayout ?? 'vertical',
    };
    const roundAmount = (value) => Math.round(value * 1e10) / 1e10;

    const applyClockToFuelAmount = (nextPlantType, nextFuel, nextMachineCount) => {
        const nextPlantData = getPowerPlantData(nextPlantType, nextFuel, {
            clockSpeed: 1,
            machineCount: nextMachineCount,
        });
        const fuelResource = POWER_PLANTS[nextPlantType].fuels[nextPlantData.fuel].resource;
        const nextBaseFuelAmount = nextPlantData.ingredients[fuelResource];
        const clockSpeed = Math.min(
            Math.max(Number(clockPercent) / 100 || 0.01, 0.01),
            2.5,
        );

        setClockPercent(roundAmount(clockSpeed * 100));
        setFuelAmount(roundAmount(nextBaseFuelAmount * clockSpeed));
    };

    const changePlantType = (nextPlantType) => {
        const nextFuel = getPowerPlantFuelIds(nextPlantType)[0];

        setPlantType(nextPlantType);
        setFuel(nextFuel);
        applyClockToFuelAmount(nextPlantType, nextFuel, machineCount);
    };

    const changeFuel = (nextFuel) => {
        setFuel(nextFuel);
        applyClockToFuelAmount(plantType, nextFuel, machineCount);
    };

    const changeMachineCount = (value) => {
        setMachineCount(value);
        applyClockToFuelAmount(plantType, fuel, value);
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
            setFuelAmount(roundAmount(baseFuelAmount * clockSpeed));
        }
    };

    const changeFuelAmount = (value) => {
        if (value === '') {
            setFuelAmount(value);
            return;
        }

        if (Number.isFinite(Number(value))) {
            const cappedAmount = Math.min(Number(value), maximumFuelAmount);
            const clockSpeed = getClockSpeedForPowerPlantFuel(cappedAmount, baseFuelAmount);

            setFuelAmount(cappedAmount);
            setClockPercent(roundAmount(clockSpeed * 100));
        }
    };

    const normalizeMachineCount = () => {
        const normalizedCount = nextData.machineCount;
        const normalizedBaseData = getPowerPlantData(plantType, fuel, {
            clockSpeed: 1,
            machineCount: normalizedCount,
        });

        setMachineCount(normalizedCount);
        setFuelAmount(roundAmount(
            normalizedBaseData.ingredients[selectedFuel.resource] * nextData.clockSpeed,
        ));
    };

    const normalizeClockPercent = () => {
        setClockPercent(roundAmount(nextData.clockSpeed * 100));
        setFuelAmount(roundAmount(baseFuelAmount * nextData.clockSpeed));
    };

    const normalizeFuelAmount = () => {
        const clockSpeed = getClockSpeedForPowerPlantFuel(fuelAmount, baseFuelAmount);

        setClockPercent(roundAmount(clockSpeed * 100));
        setFuelAmount(roundAmount(baseFuelAmount * clockSpeed));
    };

    const finish = () => {
        setNode(null);
        closeModal();
    };

    const saveAndClose = () => {
        if (plantType !== node.data.plantType || nextData.fuel !== node.data.fuel) {
            setEdges((edges) => edges.filter((edge) => (
                edge.source !== node.id && edge.target !== node.id
            )));
        }
        updateNodeData(node.id, nextData, { replace: true });
        finish();
    };

    const cancelAndClose = () => {
        if (powerPlantNodeIsNew) {
            setEdges((edges) => edges.filter((edge) => (
                edge.source !== node.id && edge.target !== node.id
            )));
            setNodes((nodes) => nodes.filter((candidate) => candidate.id !== node.id));
        }
        finish();
    };

    return (
        <Modal
            isOpen={isOpen.powerPlantNode}
            onRequestClose={cancelAndClose}
            style={customStyles}
        >
            <h2>{powerPlantNodeIsNew ? 'Add Power Plant' : 'Edit Power Plant'}</h2>
            <div className="resource-node-modal__preview">
                <img src={`./img/${plant.img}.png`} alt={plant.label} />
                <div>
                    <strong>{plant.label}</strong>
                    <span>{nextData.energyProduction.toLocaleString()} MW</span>
                </div>
            </div>
            <label className="resource-node-modal__field">
                <span>Power plant</span>
                <select
                    value={plantType}
                    onChange={(event) => changePlantType(event.target.value)}
                >
                    {Object.entries(POWER_PLANTS).map(([plantId, option]) => (
                        <option value={plantId} key={plantId}>{option.label}</option>
                    ))}
                </select>
            </label>
            <label className="resource-node-modal__field">
                <span>Fuel</span>
                <select value={nextData.fuel} onChange={(event) => changeFuel(event.target.value)}>
                    {fuelIds.map((fuelId) => (
                        <option value={fuelId} key={fuelId}>{plant.fuels[fuelId].label}</option>
                    ))}
                </select>
            </label>
            <label className="resource-node-modal__field">
                <span>Number of plants</span>
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
                <span>Fuel per minute</span>
                <div className="resource-node-modal__clock">
                    <input
                        type="number"
                        min={baseFuelAmount * 0.01}
                        max={maximumFuelAmount}
                        step="any"
                        value={fuelAmount}
                        onChange={(event) => changeFuelAmount(event.target.value)}
                        onBlur={normalizeFuelAmount}
                    />
                    <span>units</span>
                </div>
            </label>
            <p className="resource-node-modal__note">
                Inputs, waste, and power output scale with plant count and clock speed.
            </p>
            <button className="default" onClick={saveAndClose}>Save</button>
        </Modal>
    );
}
