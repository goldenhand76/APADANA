import {RESET_GRAPH_DATA, SET_GRAPH_DATA, UPDATE_GRAPH_DATA} from "../constrants/actionTypes";


let graphs = [];

export default (state = [], action) => {
    switch (action.type) {
        case SET_GRAPH_DATA:
            graphs = [...graphs, action.payload];
            return graphs;
        case RESET_GRAPH_DATA:
            return graphs = [];
        case UPDATE_GRAPH_DATA:
            return updateGraphData(action.payload);
        default:
            return state;
    }
}

function updateGraphData(data) {
    const index = graphs?.findIndex(item => item?.id === data?.id);

    if (index !== -1) {
        let graph = graphs[index];
        graph.data = data?.data;
        graphs[index] = graph;
    }
    return graphs;
}

function setGraph(data) {
    if (data) {
        graphs.push(data)
    }
    return graphs;
}

function resetGraph() {
    return graphs = [];
}