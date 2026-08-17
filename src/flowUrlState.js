import {
    deflateSync,
    inflateSync,
    strFromU8,
    strToU8,
} from 'fflate';
import { getShape } from './functions';
import { getPowerPlantData } from './powerPlants';
import { getResourceNodeData } from './resourceNodes';

const FLOW_HASH_PREFIX = '#flow=';
const FLOW_STATE_VERSION = 1;

const encodeBytesBase64Url = (bytes) => {
    let binary = '';

    for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }

    return btoa(binary)
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/u, '');
};

const decodeBase64UrlBytes = (value) => {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
    );
    const binary = atob(padded);

    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const encodeFlowState = (state) => {
    const jsonBytes = strToU8(JSON.stringify(state));
    const compressedBytes = deflateSync(jsonBytes, { level: 6 });

    return encodeBytesBase64Url(compressedBytes);
};

const decodeFlowState = (encodedState) => {
    try {
        const compressedBytes = decodeBase64UrlBytes(encodedState);
        const json = strFromU8(inflateSync(compressedBytes));

        return JSON.parse(json);
    } catch {
        return null;
    }
};

const readFlowStateFromUrl = (locationObject = window.location) => {
    if (!locationObject.hash?.startsWith(FLOW_HASH_PREFIX)) return null;

    return decodeFlowState(locationObject.hash.slice(FLOW_HASH_PREFIX.length));
};

const replaceFlowStateInUrl = (state, windowObject = window) => {
    const encodedState = encodeFlowState(state);
    const nextUrl = `${windowObject.location.pathname}${windowObject.location.search}${FLOW_HASH_PREFIX}${encodedState}`;

    windowObject.history.replaceState(windowObject.history.state, '', nextUrl);
};

const getPersistentNodeData = (node) => {
    const data = node.data ?? {};

    if (node.type === 'recipeNode') {
        return {
            amplification: data.amplification,
            clockSpeed: data.clockSpeed,
            connectorLayout: data.connectorLayout,
            machineCount: data.machineCount,
            recipeId: data.recipe?.className,
        };
    }
    if (node.type === 'resourceNode') {
        return {
            clockSpeed: data.clockSpeed,
            connectorLayout: data.connectorLayout,
            ...(data.layoutLocked === true && { layoutLocked: true }),
            machineCount: data.machineCount,
            minerTier: data.minerTier,
            quality: data.quality,
            resource: data.resource,
        };
    }
    if (node.type === 'powerPlantNode') {
        return {
            clockSpeed: data.clockSpeed,
            connectorLayout: data.connectorLayout,
            fuel: data.fuel,
            machineCount: data.machineCount,
            plantType: data.plantType,
        };
    }

    return data;
};

const serializeNode = (node) => {
    const {
        dragging,
        measured,
        resizing,
        selected,
        ...persistentNode
    } = node;

    return {
        ...persistentNode,
        data: getPersistentNodeData(node),
    };
};

const serializeEdge = (edge) => {
    const { selected, ...persistentEdge } = edge;
    const data = { ...edge.data };

    delete data.item;

    return { ...persistentEdge, data };
};

const serializeFlowState = ({
    edges,
    nodes,
    viewport,
}) => ({
    edges: edges.map(serializeEdge),
    nodes: nodes.map(serializeNode),
    version: FLOW_STATE_VERSION,
    viewport,
});

const hydrateNode = (node, { constructors, recipes }) => {
    const data = node.data ?? {};
    const connectorLayout = data.connectorLayout ?? 'vertical';

    if (node.type === 'recipeNode') {
        const recipe = recipes[data.recipeId];
        const factory = recipe ? constructors[recipe.producedIn] : null;

        if (!recipe || !factory) return null;

        return {
            ...node,
            data: {
                ...getShape({
                    amplification: data.amplification,
                    clockSpeed: data.clockSpeed,
                    factory,
                    machineCount: data.machineCount,
                    recipe,
                }),
                connectorLayout,
            },
        };
    }
    if (node.type === 'resourceNode') {
        const layoutLocked = data.layoutLocked === true;

        return {
            ...node,
            draggable: layoutLocked ? false : node.draggable,
            data: {
                ...getResourceNodeData(data.resource, data.quality, {
                    clockSpeed: data.clockSpeed,
                    machineCount: data.machineCount,
                    minerTier: data.minerTier,
                }),
                connectorLayout,
                layoutLocked,
            },
        };
    }
    if (node.type === 'powerPlantNode') {
        return {
            ...node,
            data: {
                ...getPowerPlantData(data.plantType, data.fuel, {
                    clockSpeed: data.clockSpeed,
                    machineCount: data.machineCount,
                }),
                connectorLayout,
            },
        };
    }

    return node;
};

const hydrateFlowState = (state, catalogs) => {
    const nodes = Array.isArray(state?.nodes)
        ? state.nodes.map((node) => hydrateNode(node, catalogs)).filter(Boolean)
        : [];
    const nodeIds = new Set(nodes.map(({ id }) => id));
    const edges = Array.isArray(state?.edges)
        ? state.edges
            .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
            .map((edge) => {
                const resource = edge.data?.resource;

                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        ...(resource ? { item: catalogs.items[resource] } : {}),
                    },
                };
            })
        : [];

    return {
        edges,
        nodes,
        viewport: {
            x: Number(state?.viewport?.x) || 0,
            y: Number(state?.viewport?.y) || 0,
            zoom: Number(state?.viewport?.zoom) || 1,
        },
    };
};

export {
    decodeFlowState,
    encodeFlowState,
    hydrateFlowState,
    readFlowStateFromUrl,
    replaceFlowStateInUrl,
    serializeFlowState,
};
