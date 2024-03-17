import {
    SET_TILES_DATA,
    SET_TILE_DATA,
    ADD_TILE,
    REMOVE_TILE
} from '../constrants/actionTypes';


let tiles = [];
export default (state = [], action) => {
    switch (action.type) {
        case SET_TILES_DATA:
            return setTiles(action.payload);
        case SET_TILE_DATA:
            return setTile(action.payload);
        case ADD_TILE:
            return addTile(action.payload);
        default:
            return state;
    }
};


function setTiles(data) {
    tiles = []
    tiles = data.map(item => {
        return {
            id: item.id,
            data: item.data ? item.data : null,
            is_online: item.is_online,
            interval: item.interval
        }
    })
    return tiles;
}

function setTile(data) {

    const index = tiles.findIndex(item => item.id === data.id);
    let selectedTile = {...tiles[index]};

    if(data.data !== null) selectedTile.data = data.data;

    data?.is_online ? selectedTile.is_online = data.is_online : null
    const allTiles = [...tiles];
    allTiles[index] = selectedTile;
    tiles = allTiles;
    return tiles;
}

function addTile(data) {
    const index = tiles.findIndex(item => item.id === data.id);
    if (index === -1) {
        const tile = {
            id: data.id,
            data: data.data ? data.data : null
        }
        tiles.push(tile)
        return tiles;
    }
    return tiles;
}

function reomveTile(id) {
    return tiles.filter(item => item.id !== id);
}



